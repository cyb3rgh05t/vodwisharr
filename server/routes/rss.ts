import TheMovieDb from '@server/api/themoviedb';
import { MediaType } from '@server/constants/media';
import Media from '@server/entity/Media';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';
import type { MovieResult, TvResult } from '@server/models/Search';
import { mapMovieResult, mapTvResult } from '@server/models/Search';
import { isCollection, isMovie, isPerson } from '@server/utils/typeHelpers';
import { Router } from 'express';
import RSS from 'rss';

const rssRoutes = Router();

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

/**
 * Authenticate RSS requests via ?apikey= query parameter,
 * since RSS readers cannot send custom headers.
 */
rssRoutes.use((req, res, next) => {
  const settings = getSettings();
  const apikey = req.query.apikey as string | undefined;

  if (!apikey || apikey !== settings.main.apiKey) {
    return res.status(401).json({
      status: 401,
      error: 'Invalid or missing API key. Use ?apikey=YOUR_API_KEY',
    });
  }

  next();
});

const getBaseUrl = (): string => {
  const settings = getSettings();
  return settings.main.applicationUrl || 'http://localhost:5055';
};

const getFeedTitle = (): string => {
  const settings = getSettings();
  return settings.main.applicationTitle || 'StreamNet VOD';
};

const movieToRssItem = (movie: MovieResult): RSS.ItemOptions => {
  const baseUrl = getBaseUrl();
  const posterUrl = movie.posterPath
    ? `${TMDB_IMAGE_BASE}/w600_and_h900_bestv2${movie.posterPath}`
    : undefined;

  const genres = movie.genreIds?.join(', ') || '';
  const description = [
    movie.overview || '',
    '',
    `Bewertung: ${movie.voteAverage}/10 (${movie.voteCount} Stimmen)`,
    `Erscheinungsdatum: ${movie.releaseDate || 'Unbekannt'}`,
    genres ? `Genre-IDs: ${genres}` : '',
    posterUrl ? `Poster: ${posterUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title: movie.title || movie.originalTitle,
    url: `${baseUrl}/movie/${movie.id}`,
    guid: `movie-${movie.id}`,
    date: movie.releaseDate ? new Date(movie.releaseDate) : new Date(),
    description,
    enclosure: posterUrl ? { url: posterUrl, type: 'image/jpeg' } : undefined,
  };
};

const tvToRssItem = (tv: TvResult): RSS.ItemOptions => {
  const baseUrl = getBaseUrl();
  const posterUrl = tv.posterPath
    ? `${TMDB_IMAGE_BASE}/w600_and_h900_bestv2${tv.posterPath}`
    : undefined;

  const genres = tv.genreIds?.join(', ') || '';
  const description = [
    tv.overview || '',
    '',
    `Bewertung: ${tv.voteAverage}/10 (${tv.voteCount} Stimmen)`,
    `Erstausstrahlung: ${tv.firstAirDate || 'Unbekannt'}`,
    genres ? `Genre-IDs: ${genres}` : '',
    posterUrl ? `Poster: ${posterUrl}` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return {
    title: tv.name || tv.originalName,
    url: `${baseUrl}/tv/${tv.id}`,
    guid: `tv-${tv.id}`,
    date: tv.firstAirDate ? new Date(tv.firstAirDate) : new Date(),
    description,
    enclosure: posterUrl ? { url: posterUrl, type: 'image/jpeg' } : undefined,
  };
};

const createFeed = (
  title: string,
  description: string,
  feedUrl: string
): RSS => {
  const baseUrl = getBaseUrl();
  const appTitle = getFeedTitle();

  return new RSS({
    title: `${appTitle} - ${title}`,
    description,
    feed_url: `${baseUrl}${feedUrl}`,
    site_url: baseUrl,
    language: 'de-de',
    copyright: `${appTitle} ${new Date().getFullYear()}`,
    pubDate: new Date(),
  });
};

// =====================
// Trending (Movies + TV)
// =====================
rssRoutes.get('/trending', async (req, res, next) => {
  try {
    const language = (req.query.language as string) || 'de';
    const tmdb = new TheMovieDb();
    const data = await tmdb.getAllTrending({
      page: 1,
      language,
    });

    const media = await Media.getRelatedMedia(
      data.results.map((result) => result.id)
    );

    const feed = createFeed(
      'Trending',
      'Aktuell angesagte Filme und Serien',
      `/api/v1/rss/trending?apikey=${req.query.apikey}&language=${language}`
    );

    for (const result of data.results) {
      if (isPerson(result) || isCollection(result)) continue;

      if (isMovie(result)) {
        const mapped = mapMovieResult(
          result,
          media.find(
            (m) => m.tmdbId === result.id && m.mediaType === MediaType.MOVIE
          )
        );
        feed.item(movieToRssItem(mapped));
      } else {
        const mapped = mapTvResult(
          result,
          media.find(
            (m) => m.tmdbId === result.id && m.mediaType === MediaType.TV
          )
        );
        feed.item(tvToRssItem(mapped));
      }
    }

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    return res.send(feed.xml({ indent: true }));
  } catch (e) {
    logger.error('Failed to generate trending RSS feed', {
      label: 'RSS',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to generate trending RSS feed.',
    });
  }
});

// =====================
// Popular Movies
// =====================
rssRoutes.get('/popular-movies', async (req, res, next) => {
  try {
    const language = (req.query.language as string) || 'de';
    const tmdb = new TheMovieDb();
    const data = await tmdb.getDiscoverMovies({
      page: 1,
      language,
      sortBy: 'popularity.desc',
    });

    const media = await Media.getRelatedMedia(
      data.results.map((result) => result.id)
    );

    const feed = createFeed(
      'Beliebte Filme',
      'Die beliebtesten Filme',
      `/api/v1/rss/popular-movies?apikey=${req.query.apikey}&language=${language}`
    );

    for (const result of data.results) {
      const mapped = mapMovieResult(
        result,
        media.find(
          (m) => m.tmdbId === result.id && m.mediaType === MediaType.MOVIE
        )
      );
      feed.item(movieToRssItem(mapped));
    }

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    return res.send(feed.xml({ indent: true }));
  } catch (e) {
    logger.error('Failed to generate popular movies RSS feed', {
      label: 'RSS',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to generate popular movies RSS feed.',
    });
  }
});

// =====================
// Popular TV Shows
// =====================
rssRoutes.get('/popular-tv', async (req, res, next) => {
  try {
    const language = (req.query.language as string) || 'de';
    const tmdb = new TheMovieDb();
    const data = await tmdb.getDiscoverTv({
      page: 1,
      language,
      sortBy: 'popularity.desc',
    });

    const media = await Media.getRelatedMedia(
      data.results.map((result) => result.id)
    );

    const feed = createFeed(
      'Beliebte Serien',
      'Die beliebtesten Serien',
      `/api/v1/rss/popular-tv?apikey=${req.query.apikey}&language=${language}`
    );

    for (const result of data.results) {
      const mapped = mapTvResult(
        result,
        media.find(
          (m) => m.tmdbId === result.id && m.mediaType === MediaType.TV
        )
      );
      feed.item(tvToRssItem(mapped));
    }

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    return res.send(feed.xml({ indent: true }));
  } catch (e) {
    logger.error('Failed to generate popular TV RSS feed', {
      label: 'RSS',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to generate popular TV RSS feed.',
    });
  }
});

// =====================
// Upcoming Movies
// =====================
rssRoutes.get('/upcoming-movies', async (req, res, next) => {
  try {
    const language = (req.query.language as string) || 'de';
    const tmdb = new TheMovieDb();

    const now = new Date();
    const offset = now.getTimezoneOffset();
    const date = new Date(now.getTime() - offset * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const data = await tmdb.getDiscoverMovies({
      page: 1,
      language,
      primaryReleaseDateGte: date,
    });

    const media = await Media.getRelatedMedia(
      data.results.map((result) => result.id)
    );

    const feed = createFeed(
      'Kommende Filme',
      'Demnächst erscheinende Filme',
      `/api/v1/rss/upcoming-movies?apikey=${req.query.apikey}&language=${language}`
    );

    for (const result of data.results) {
      const mapped = mapMovieResult(
        result,
        media.find(
          (m) => m.tmdbId === result.id && m.mediaType === MediaType.MOVIE
        )
      );
      feed.item(movieToRssItem(mapped));
    }

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    return res.send(feed.xml({ indent: true }));
  } catch (e) {
    logger.error('Failed to generate upcoming movies RSS feed', {
      label: 'RSS',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to generate upcoming movies RSS feed.',
    });
  }
});

// =====================
// Upcoming TV Shows
// =====================
rssRoutes.get('/upcoming-tv', async (req, res, next) => {
  try {
    const language = (req.query.language as string) || 'de';
    const tmdb = new TheMovieDb();

    const now = new Date();
    const offset = now.getTimezoneOffset();
    const date = new Date(now.getTime() - offset * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const data = await tmdb.getDiscoverTv({
      page: 1,
      language,
      firstAirDateGte: date,
    });

    const media = await Media.getRelatedMedia(
      data.results.map((result) => result.id)
    );

    const feed = createFeed(
      'Kommende Serien',
      'Demnächst startende Serien',
      `/api/v1/rss/upcoming-tv?apikey=${req.query.apikey}&language=${language}`
    );

    for (const result of data.results) {
      const mapped = mapTvResult(
        result,
        media.find(
          (m) => m.tmdbId === result.id && m.mediaType === MediaType.TV
        )
      );
      feed.item(tvToRssItem(mapped));
    }

    res.set('Content-Type', 'application/rss+xml; charset=utf-8');
    return res.send(feed.xml({ indent: true }));
  } catch (e) {
    logger.error('Failed to generate upcoming TV RSS feed', {
      label: 'RSS',
      errorMessage: e.message,
    });
    return next({
      status: 500,
      message: 'Unable to generate upcoming TV RSS feed.',
    });
  }
});

export default rssRoutes;

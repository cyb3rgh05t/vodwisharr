import LoadingSpinner from '@app/components/Common/LoadingSpinner';
import PageTitle from '@app/components/Common/PageTitle';
import SensitiveInput from '@app/components/Common/SensitiveInput';
import CopyButton from '@app/components/Settings/CopyButton';
import globalMessages from '@app/i18n/globalMessages';
import type { MainSettings } from '@server/lib/settings';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages({
  rssfeeds: 'RSS Feeds',
  rssfeedsDescription:
    'Use these RSS feed URLs to subscribe to content updates in your favorite RSS reader. Each URL contains your API key for authentication.',
  jsonfeeds: 'JSON Feeds',
  jsonfeedsDescription:
    'Use these JSON feed URLs to get structured data. Movie feeds return title, TMDB ID and IMDB ID. TV feeds return title, TVDB ID and IMDB ID.',
  trending: 'Trending',
  trendingDescription: 'Currently trending movies and TV shows.',
  trendingMovies: 'Trending Movies',
  trendingMoviesDescription: 'Currently trending movies.',
  trendingTv: 'Trending TV Shows',
  trendingTvDescription: 'Currently trending TV shows.',
  popularMovies: 'Popular Movies',
  popularMoviesDescription: 'The most popular movies right now.',
  popularTv: 'Popular TV Shows',
  popularTvDescription: 'The most popular TV shows right now.',
  upcomingMovies: 'Upcoming Movies',
  upcomingMoviesDescription: 'Movies that are coming soon.',
  upcomingTv: 'Upcoming TV Shows',
  upcomingTvDescription: 'TV shows that are starting soon.',
  apiKeyWarning: 'These URLs contain your API key. Do not share them publicly!',
  languageHint:
    'You can append &language=en (or any ISO 639-1 code) to change the language. Default is German (de).',
});

interface RssFeedRowProps {
  label: string;
  description: string;
  url: string;
}

const RssFeedRow = ({ label, description, url }: RssFeedRowProps) => {
  return (
    <div className="form-row">
      <label className="text-label">
        <span>{label}</span>
        <span className="label-tip">{description}</span>
      </label>
      <div className="form-input-area">
        <div className="form-input-field">
          <SensitiveInput
            type="text"
            className="rounded-l-only"
            value={url}
            readOnly
          />
          <CopyButton textToCopy={url} key={url} />
        </div>
      </div>
    </div>
  );
};

const SettingsRss = () => {
  const intl = useIntl();
  const { data, error } = useSWR<MainSettings>('/api/v1/settings/main');

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  const baseUrl = data?.applicationUrl || window.location.origin;
  const apiKey = data?.apiKey || '';

  const feeds = [
    {
      label: intl.formatMessage(messages.trending),
      description: intl.formatMessage(messages.trendingDescription),
      path: '/api/v1/rss/trending',
    },
    {
      label: intl.formatMessage(messages.popularMovies),
      description: intl.formatMessage(messages.popularMoviesDescription),
      path: '/api/v1/rss/popular-movies',
    },
    {
      label: intl.formatMessage(messages.popularTv),
      description: intl.formatMessage(messages.popularTvDescription),
      path: '/api/v1/rss/popular-tv',
    },
    {
      label: intl.formatMessage(messages.upcomingMovies),
      description: intl.formatMessage(messages.upcomingMoviesDescription),
      path: '/api/v1/rss/upcoming-movies',
    },
    {
      label: intl.formatMessage(messages.upcomingTv),
      description: intl.formatMessage(messages.upcomingTvDescription),
      path: '/api/v1/rss/upcoming-tv',
    },
  ];

  const jsonFeeds = [
    {
      label: intl.formatMessage(messages.trendingMovies),
      description: intl.formatMessage(messages.trendingMoviesDescription),
      path: '/api/v1/rss/json/trending-movies',
    },
    {
      label: intl.formatMessage(messages.trendingTv),
      description: intl.formatMessage(messages.trendingTvDescription),
      path: '/api/v1/rss/json/trending-tv',
    },
    {
      label: intl.formatMessage(messages.popularMovies),
      description: intl.formatMessage(messages.popularMoviesDescription),
      path: '/api/v1/rss/json/popular-movies',
    },
    {
      label: intl.formatMessage(messages.popularTv),
      description: intl.formatMessage(messages.popularTvDescription),
      path: '/api/v1/rss/json/popular-tv',
    },
    {
      label: intl.formatMessage(messages.upcomingMovies),
      description: intl.formatMessage(messages.upcomingMoviesDescription),
      path: '/api/v1/rss/json/upcoming-movies',
    },
    {
      label: intl.formatMessage(messages.upcomingTv),
      description: intl.formatMessage(messages.upcomingTvDescription),
      path: '/api/v1/rss/json/upcoming-tv',
    },
  ];

  return (
    <>
      <PageTitle
        title={[
          intl.formatMessage(messages.rssfeeds),
          intl.formatMessage(globalMessages.settings),
        ]}
      />
      <div className="mb-6">
        <h3 className="heading">{intl.formatMessage(messages.rssfeeds)}</h3>
        <p className="description">
          {intl.formatMessage(messages.rssfeedsDescription)}
        </p>
      </div>
      <div className="section">
        <div className="form-row">
          <div className="form-input-area max-w-full">
            <div className="mb-4 rounded-md bg-yellow-600 bg-opacity-20 p-4 text-yellow-200">
              <p className="text-sm font-medium">
                ⚠️ {intl.formatMessage(messages.apiKeyWarning)}
              </p>
              <p className="mt-1 text-sm opacity-80">
                💡 {intl.formatMessage(messages.languageHint)}
              </p>
            </div>
          </div>
        </div>
        {feeds.map((feed) => (
          <RssFeedRow
            key={feed.path}
            label={feed.label}
            description={feed.description}
            url={`${baseUrl}${feed.path}?apikey=${apiKey}`}
          />
        ))}
      </div>
      <div className="mb-6 mt-10">
        <h3 className="heading">{intl.formatMessage(messages.jsonfeeds)}</h3>
        <p className="description">
          {intl.formatMessage(messages.jsonfeedsDescription)}
        </p>
      </div>
      <div className="section">
        {jsonFeeds.map((feed) => (
          <RssFeedRow
            key={feed.path}
            label={feed.label}
            description={feed.description}
            url={`${baseUrl}${feed.path}?apikey=${apiKey}`}
          />
        ))}
      </div>
    </>
  );
};

export default SettingsRss;

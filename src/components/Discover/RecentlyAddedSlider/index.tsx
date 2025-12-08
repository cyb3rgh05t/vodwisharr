import Slider from '@app/components/Slider';
import TmdbTitleCard from '@app/components/TitleCard/TmdbTitleCard';
import { Permission, useUser } from '@app/hooks/useUser';
import { ClockIcon } from '@heroicons/react/24/outline';
import type { MediaResultsResponse } from '@server/interfaces/api/mediaInterfaces';
import { defineMessages, useIntl } from 'react-intl';
import useSWR from 'swr';

const messages = defineMessages({
  recentlyAdded: 'Recently Added',
});

const RecentlyAddedSlider = () => {
  const intl = useIntl();
  const { hasPermission } = useUser();
  const { data: media, error: mediaError } = useSWR<MediaResultsResponse>(
    '/api/v1/media?filter=allavailable&take=40&sort=mediaAdded',
    { revalidateOnMount: true }
  );

  if (
    (media && !media.results.length && !mediaError) ||
    !hasPermission([Permission.MANAGE_REQUESTS, Permission.RECENT_VIEW], {
      type: 'or',
    })
  ) {
    return null;
  }

  return (
    <>
      <div className="slider-header">
        <div className="slider-title group">
          <ClockIcon className="mr-2 h-7 w-7 text-yellow-400 transition-transform duration-300 group-hover:scale-110" />
          <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            {intl.formatMessage(messages.recentlyAdded)}
          </span>
        </div>
      </div>
      <Slider
        sliderKey="media"
        isLoading={!media}
        items={(media?.results ?? []).map((item) => (
          <TmdbTitleCard
            key={`media-slider-item-${item.id}`}
            id={item.id}
            tmdbId={item.tmdbId}
            tvdbId={item.tvdbId}
            type={item.mediaType}
          />
        ))}
      />
    </>
  );
};

export default RecentlyAddedSlider;

import { sliderTitles } from '@app/components/Discover/constants';
import RequestCard from '@app/components/RequestCard';
import Slider from '@app/components/Slider';
import { ArrowRightCircleIcon, InboxIcon } from '@heroicons/react/24/outline';
import type { RequestResultsResponse } from '@server/interfaces/api/requestInterfaces';
import Link from 'next/link';
import { useIntl } from 'react-intl';
import useSWR from 'swr';

const RecentRequestsSlider = () => {
  const intl = useIntl();
  const { data: requests, error: requestError } =
    useSWR<RequestResultsResponse>(
      '/api/v1/request?filter=all&take=10&sort=modified&skip=0',
      {
        revalidateOnMount: true,
      }
    );

  if (requests && requests.results.length === 0 && !requestError) {
    return null;
  }

  return (
    <>
      <div className="slider-header">
        <Link href="/requests?filter=all">
          <a className="slider-title group">
            <InboxIcon className="mr-2 h-7 w-7 text-blue-400 transition-transform duration-300 group-hover:scale-110" />
            <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {intl.formatMessage(sliderTitles.recentrequests)}
            </span>
            <ArrowRightCircleIcon />
          </a>
        </Link>
      </div>
      <Slider
        sliderKey="requests"
        isLoading={!requests}
        items={(requests?.results ?? []).map((request) => (
          <RequestCard
            key={`request-slider-item-${request.id}`}
            request={request}
          />
        ))}
        placeholder={<RequestCard.Placeholder />}
      />
    </>
  );
};

export default RecentRequestsSlider;

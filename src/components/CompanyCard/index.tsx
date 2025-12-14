import CachedImage from '@app/components/Common/CachedImage';
import Link from 'next/link';
import { useState } from 'react';

interface CompanyCardProps {
  name: string;
  image: string;
  url: string;
}

const CompanyCard = ({ image, url, name }: CompanyCardProps) => {
  const [isHovered, setHovered] = useState(false);

  return (
    <Link href={url}>
      <a
        className={`relative flex h-32 w-56 transform-gpu cursor-pointer items-center justify-center p-8 transition duration-300 ease-in-out sm:h-36 sm:w-72 ${
          isHovered ? 'scale-105' : 'scale-100'
        } rounded-xl`}
        style={{
          background: isHovered
            ? 'rgba(170, 170, 170, 0.2)'
            : 'rgba(170, 170, 170, 0.1)',
          boxShadow: 'none',
          border: 'none',
        }}
        onMouseEnter={() => {
          setHovered(true);
        }}
        onMouseLeave={() => {
          setHovered(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setHovered(true);
          }
        }}
        role="link"
        tabIndex={0}
      >
        <div className="relative h-full w-full">
          <CachedImage
            src={image}
            alt={name}
            className="relative z-40 h-full w-full"
            layout="fill"
            objectFit="contain"
          />
        </div>
      </a>
    </Link>
  );
};

export default CompanyCard;

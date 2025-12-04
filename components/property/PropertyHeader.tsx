'use client';

import { useTranslations } from 'next-intl';
import { MapPinIcon, StarIcon } from '@/components/ui/Icons';

interface PropertyHeaderProps {
  name: string;
  address: string;
  rating: number;
  reviewCount: number;
}

export const PropertyHeader: React.FC<PropertyHeaderProps> = ({
  name,
  address,
  rating,
  reviewCount,
}) => {
  const t = useTranslations('property');

  return (
    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
      <div className="flex-1">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-neutral-900 mb-3">
          {name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-neutral-600">
          {/* Address */}
          <div className="flex items-center gap-2">
            <MapPinIcon size={20} className="text-primary-600" />
            <span className="font-medium">{address}</span>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, index) => (
                <StarIcon
                  key={index}
                  size={18}
                  className={
                    index < Math.floor(rating)
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-neutral-300'
                  }
                />
              ))}
            </div>
            <span className="font-semibold">{rating}</span>
            <span className="text-neutral-500">({reviewCount} {t('header.reviews')})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

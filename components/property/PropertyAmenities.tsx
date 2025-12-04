'use client';

import { useTranslations } from 'next-intl';
import {
  WifiIcon,
  BriefcaseIcon,
  HomeIcon,
  CarIcon,
  TvIcon,
  WindIcon,
  ThermometerIcon,
  CheckIcon,
  ShieldIcon,
  PawIcon,
  HeartIcon,
  MapPinIcon,
} from '@/components/ui/Icons';

interface PropertyAmenitiesProps {
  amenities: string[];
}

const amenityIconMap: Record<string, React.ReactNode> = {
  wifi: <WifiIcon size={24} />,
  workspace: <BriefcaseIcon size={24} />,
  kitchen: <HomeIcon size={24} />,
  washer: <HomeIcon size={24} />,
  tv: <TvIcon size={24} />,
  ac: <WindIcon size={24} />,
  heating: <ThermometerIcon size={24} />,
  smoke_detector: <ShieldIcon size={24} />,
  first_aid: <ShieldIcon size={24} />,
  parking: <CarIcon size={24} />,
  pet_friendly: <PawIcon size={24} />,
  near_hospital: <HeartIcon size={24} />,
  public_transport: <MapPinIcon size={24} />,
};

export const PropertyAmenities: React.FC<PropertyAmenitiesProps> = ({ amenities }) => {
  const t = useTranslations('property.amenities');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {amenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-3 p-4 bg-white border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
          >
            <div className="text-primary-600 flex-shrink-0">
              {amenityIconMap[amenity] || <CheckIcon size={24} />}
            </div>
            <span className="font-medium text-neutral-900">
              {t(`items.${amenity}`)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

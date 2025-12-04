'use client';

import { useTranslations } from 'next-intl';
import { MapPinIcon } from '@/components/ui/Icons';
import type { NearbyPlace } from '@/lib/data/properties';

interface PropertyLocationProps {
  address: string;
  nearbyPlaces: NearbyPlace[];
}

export const PropertyLocation: React.FC<PropertyLocationProps> = ({
  address,
  nearbyPlaces,
}) => {
  const t = useTranslations('property.location');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
        {t('title')}
      </h2>

      {/* Map Placeholder */}
      <div className="relative h-80 rounded-xl overflow-hidden bg-luxury-cream-100 border-2 border-luxury-beige-300">
        <div className="w-full h-full">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-lg flex items-center gap-3 shadow-medium">
              <MapPinIcon size={32} className="text-primary-600" />
              <div>
                <div className="font-bold text-lg text-neutral-900">{t('mapPlaceholder')}</div>
                <div className="text-sm text-neutral-600">{address}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Nearby Places */}
      <div>
        <h3 className="text-xl font-semibold text-neutral-900 mb-4">
          {t('nearbyTitle')}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nearbyPlaces.map((place, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MapPinIcon size={20} className="text-primary-600" />
                <span className="font-medium text-neutral-900">{place.name}</span>
              </div>
              <span className="text-sm text-neutral-600 font-medium">{place.distance}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Transport Info */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          {t('transportTitle')}
        </h3>
        <p className="text-neutral-700">
          {t('transportDescription')}
        </p>
      </div>
    </div>
  );
};

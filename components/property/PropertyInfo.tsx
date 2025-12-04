'use client';

import { useTranslations } from 'next-intl';
import { MaximizeIcon, BedIcon, BathIcon, UsersIcon, ClockIcon } from '@/components/ui/Icons';

interface PropertyInfoProps {
  size: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  checkInTime: string;
  checkOutTime: string;
}

export const PropertyInfo: React.FC<PropertyInfoProps> = ({
  size,
  bedrooms,
  bathrooms,
  maxGuests,
  checkInTime,
  checkOutTime,
}) => {
  const t = useTranslations('property.info');

  const infoItems = [
    {
      icon: <MaximizeIcon size={24} />,
      label: t('size'),
      value: `${size}m²`,
    },
    {
      icon: <BedIcon size={24} />,
      label: t('bedrooms'),
      value: bedrooms,
    },
    {
      icon: <BathIcon size={24} />,
      label: t('bathrooms'),
      value: bathrooms,
    },
    {
      icon: <UsersIcon size={24} />,
      label: t('maxGuests'),
      value: maxGuests,
    },
  ];

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        {infoItems.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="text-primary-600">{item.icon}</div>
            <div>
              <div className="text-2xl font-bold text-neutral-900">{item.value}</div>
              <div className="text-sm text-neutral-600">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Check-in/out Times */}
      <div className="pt-6 border-t border-neutral-300 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <ClockIcon size={20} className="text-primary-600" />
          <div>
            <div className="text-sm text-neutral-600">{t('checkIn')}</div>
            <div className="font-semibold text-neutral-900">{checkInTime}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ClockIcon size={20} className="text-primary-600" />
          <div>
            <div className="text-sm text-neutral-600">{t('checkOut')}</div>
            <div className="font-semibold text-neutral-900">{checkOutTime}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

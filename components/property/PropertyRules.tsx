'use client';

import { useTranslations } from 'next-intl';
import { CheckIcon, XIcon, ClockIcon, PawIcon } from '@/components/ui/Icons';

interface PropertyRulesProps {
  checkInTime: string;
  checkOutTime: string;
  quietHoursStart: string;
  quietHoursEnd: string;
  smokingAllowed: boolean;
  partiesAllowed: boolean;
  petFriendly: boolean;
  maxGuests: number;
  petFee?: number;
}

export const PropertyRules: React.FC<PropertyRulesProps> = ({
  checkInTime,
  checkOutTime,
  quietHoursStart,
  quietHoursEnd,
  smokingAllowed,
  partiesAllowed,
  petFriendly,
  maxGuests,
  petFee,
}) => {
  const t = useTranslations('property.rules');

  const rules = [
    {
      icon: <ClockIcon size={24} />,
      title: t('checkIn'),
      description: checkInTime,
      allowed: true,
    },
    {
      icon: <ClockIcon size={24} />,
      title: t('checkOut'),
      description: checkOutTime,
      allowed: true,
    },
    {
      icon: <ClockIcon size={24} />,
      title: t('quietHours'),
      description: `${quietHoursStart} - ${quietHoursEnd}`,
      allowed: true,
    },
    {
      icon: smokingAllowed ? <CheckIcon size={24} /> : <XIcon size={24} />,
      title: t('smoking'),
      description: t(smokingAllowed ? 'allowed' : 'notAllowed'),
      allowed: smokingAllowed,
    },
    {
      icon: partiesAllowed ? <CheckIcon size={24} /> : <XIcon size={24} />,
      title: t('parties'),
      description: t(partiesAllowed ? 'allowed' : 'notAllowed'),
      allowed: partiesAllowed,
    },
    {
      icon: <PawIcon size={24} />,
      title: t('pets'),
      description: petFriendly
        ? petFee
          ? t('petsAllowedWithFee', { fee: petFee })
          : t('petsAllowedFree')
        : t('notAllowed'),
      allowed: petFriendly,
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
        {t('title')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rules.map((rule, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-white border border-neutral-200 rounded-lg"
          >
            <div className={`flex-shrink-0 ${rule.allowed ? 'text-primary-600' : 'text-red-600'}`}>
              {rule.icon}
            </div>
            <div>
              <div className="font-semibold text-neutral-900 mb-1">{rule.title}</div>
              <div className="text-neutral-600">{rule.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Info */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
        <p className="text-neutral-700">
          <span className="font-semibold">{t('maxGuestsLabel')}:</span> {maxGuests} {t('guests')}
        </p>
      </div>
    </div>
  );
};

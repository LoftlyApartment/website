'use client';

import { useTranslations } from 'next-intl';
import { DollarIcon, CalendarIcon } from '@/components/ui/Icons';

interface PropertyPricingProps {
  basePrice: number;
  cleaningFee: number;
  weeklyDiscount: number;
  monthlyDiscount: number;
  petFee?: number;
  minStay: number;
}

export const PropertyPricing: React.FC<PropertyPricingProps> = ({
  basePrice,
  cleaningFee,
  weeklyDiscount,
  monthlyDiscount,
  petFee,
  minStay,
}) => {
  const t = useTranslations('property.pricing');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
        {t('title')}
      </h2>

      {/* Base Price */}
      <div className="flex items-baseline gap-2">
        <span className="text-4xl font-bold text-primary-600">€{basePrice}</span>
        <span className="text-xl text-neutral-600">/ {t('perNight')}</span>
      </div>

      {/* Pricing Details */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex items-center gap-3">
            <DollarIcon size={20} className="text-primary-600" />
            <span className="font-medium text-neutral-900">{t('cleaningFee')}</span>
          </div>
          <span className="font-semibold text-neutral-900">€{cleaningFee}</span>
        </div>

        {petFee && (
          <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarIcon size={20} className="text-primary-600" />
              <span className="font-medium text-neutral-900">{t('petFee')}</span>
            </div>
            <span className="font-semibold text-neutral-900">€{petFee}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CalendarIcon size={20} className="text-primary-600" />
            <span className="font-medium text-neutral-900">{t('minStay')}</span>
          </div>
          <span className="font-semibold text-neutral-900">
            {minStay} {minStay === 1 ? t('night') : t('nights')}
          </span>
        </div>
      </div>

      {/* Discounts */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6 space-y-3">
        <h3 className="text-lg font-semibold text-neutral-900 mb-3">
          {t('discountsTitle')}
        </h3>
        <div className="flex items-center justify-between">
          <span className="text-neutral-700">{t('weeklyDiscount')}</span>
          <span className="font-bold text-primary-600">{weeklyDiscount}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-neutral-700">{t('monthlyDiscount')}</span>
          <span className="font-bold text-primary-600">{monthlyDiscount}%</span>
        </div>
      </div>

      {/* VAT Notice */}
      <p className="text-sm text-neutral-600">
        {t('vatNotice')}
      </p>
    </div>
  );
};

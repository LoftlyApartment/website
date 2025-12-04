'use client';
import { useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useBooking } from '../../lib/context/BookingContext';
import { PROPERTIES, formatPrice } from '../../lib/utils/booking';
import { CalendarIcon, UsersIcon, InfoIcon, ChevronLeftIcon } from '../ui/Icons';

export function Step3Pricing() {
  const t = useTranslations('booking.step3');
  const tl = useTranslations('booking');
  const locale = useLocale();
  const { state, nextStep, previousStep } = useBooking();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { step1, step2, pricing, pricingLoading } = state;
  const property = step1.propertyId ? PROPERTIES[step1.propertyId] : null;

  // Show loading state while pricing is being calculated
  if (pricingLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
              <p className="text-lg font-medium text-neutral-700">{t('calculatingPricing') || 'Calculating pricing...'}</p>
              <p className="text-sm text-neutral-500 mt-2">{t('fetchingRealTimePrices') || 'Fetching real-time prices from Guestly'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!property || !pricing) {
    return (
      <Alert variant="error">
        <p>{t('errorNoPricing')}</p>
      </Alert>
    );
  }

  const dateLocale = locale === 'de' ? de : enUS;

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={previousStep}
        className="flex items-center gap-2 text-neutral-700 hover:text-primary-600 transition-colors group mb-6"
      >
        <ChevronLeftIcon size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">{tl('back')} to Guest Information</span>
      </button>

      {/* Booking Summary */}
      <Card>
        <CardHeader>
          <CardTitle>{t('bookingSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Property */}
            <div>
              <h4 className="font-semibold text-lg mb-1">{property.name}</h4>
              <p className="text-neutral-600">{t('property')}</p>
            </div>

            {/* Dates */}
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <CalendarIcon size={20} className="text-primary-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">
                  {step1.checkInDate && format(step1.checkInDate, 'PPP', { locale: dateLocale })}
                  {' - '}
                  {step1.checkOutDate && format(step1.checkOutDate, 'PPP', { locale: dateLocale })}
                </p>
                <p className="text-sm text-neutral-600">
                  {pricing.nights} {pricing.nights === 1 ? t('night') : t('nights')}
                </p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
              <UsersIcon size={20} className="text-primary-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium">
                  {step1.adults} {step1.adults === 1 ? t('adult') : t('adults')}
                  {(step1.children || 0) > 0 && `, ${step1.children} ${step1.children === 1 ? t('child') : t('children')}`}
                  {(step1.infants || 0) > 0 && `, ${step1.infants} ${step1.infants === 1 ? t('infant') : t('infants')}`}
                </p>
                <p className="text-sm text-neutral-600">{t('guests')}</p>
              </div>
            </div>

            {/* Guest Information */}
            <div className="pt-4 border-t border-neutral-200">
              <h5 className="font-semibold mb-2">{t('guestDetails')}</h5>
              <div className="space-y-1 text-sm">
                <p><span className="text-neutral-600">{t('name')}:</span> {step2.firstName} {step2.lastName}</p>
                <p><span className="text-neutral-600">{t('email')}:</span> {step2.email}</p>
                <p><span className="text-neutral-600">{t('phone')}:</span> {step2.phone}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>{t('pricingDetails')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Base Price */}
            <div className="flex justify-between items-center">
              <span>
                {formatPrice(pricing.basePrice, locale)} × {pricing.nights} {pricing.nights === 1 ? t('night') : t('nights')}
              </span>
              <span className="font-medium">{formatPrice(pricing.subtotalBeforeDiscount, locale)}</span>
            </div>

            {/* Discount */}
            {pricing.discount > 0 && (
              <div className="flex justify-between items-center text-green-600">
                <span>
                  {t('discount')} ({pricing.discountPercentage}%)
                </span>
                <span className="font-medium">-{formatPrice(pricing.discount, locale)}</span>
              </div>
            )}

            {/* Cleaning Fee */}
            <div className="flex justify-between items-center">
              <span>{t('cleaningFee')}</span>
              <span className="font-medium">{formatPrice(pricing.cleaningFee, locale)}</span>
            </div>

            {/* Pet Fee */}
            {pricing.petFee > 0 && (
              <div className="flex justify-between items-center">
                <span>{t('petFee')}</span>
                <span className="font-medium">{formatPrice(pricing.petFee, locale)}</span>
              </div>
            )}

            <div className="border-t border-neutral-200 pt-3">
              {/* Subtotal */}
              <div className="flex justify-between items-center">
                <span>{t('subtotal')}</span>
                <span className="font-medium">{formatPrice(pricing.subtotal, locale)}</span>
              </div>

              {/* VAT */}
              <div className="flex justify-between items-center text-sm text-neutral-600">
                <span>{t('vat')} ({pricing.vatRate}%)</span>
                <span>{formatPrice(pricing.vat, locale)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="border-t-2 border-neutral-300 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{t('total')}</span>
                <span className="text-2xl font-bold text-primary-600">
                  {formatPrice(pricing.total, locale)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Alert variant="info">
            <div className="text-sm">
              <p className="font-semibold mb-1">{t('securityDeposit')}</p>
              <p>{t('securityDepositNote')}</p>
            </div>
          </Alert>
        </CardFooter>
      </Card>

      {/* Important Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <InfoIcon size={20} />
            {t('importantInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <p className="font-medium mb-1">{t('cancellationPolicy')}</p>
              <p className="text-neutral-600">
                {t('cancellationSummary')}{' '}
                <Link href="/cancellation" className="text-primary-600 hover:underline" target="_blank">
                  {t('readMore')}
                </Link>
              </p>
            </div>

            <div>
              <p className="font-medium mb-1">{t('paymentTerms')}</p>
              <p className="text-neutral-600">{t('paymentTermsSummary')}</p>
            </div>

            <div>
              <p className="font-medium mb-1">{t('houseRules')}</p>
              <p className="text-neutral-600">
                {t('houseRulesSummary')}{' '}
                <Link href="/terms" className="text-primary-600 hover:underline" target="_blank">
                  {t('viewRules')}
                </Link>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button type="button" variant="outline" size="lg" onClick={previousStep}>
          {tl('back')}
        </Button>
        <Button type="button" size="lg" onClick={nextStep}>
          {t('continueToPayment')}
        </Button>
      </div>
    </div>
  );
}

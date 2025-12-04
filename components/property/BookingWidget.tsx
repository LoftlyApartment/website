'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { differenceInDays, format, addDays } from 'date-fns';
import { CalendarIcon, UsersIcon } from '@/components/ui/Icons';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { checkAvailability, formatUnavailableDates } from '@/lib/utils/availability';
import { CalendarModal } from '@/components/booking/CalendarModal';

interface BookingWidgetProps {
  propertyId: string;
  basePrice: number;
  cleaningFee: number;
  minStay: number;
  maxGuests?: number;
  locale?: string;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  propertyId,
  basePrice,
  cleaningFee,
  minStay,
  maxGuests,
  locale = 'en',
}) => {
  const t = useTranslations('property.booking');

  // Use maxGuests from props or fallback to 6
  const guestLimit = maxGuests || 6;

  // Initialize with tomorrow as check-in and day after as check-out (minStay nights)
  const [checkInDate, setCheckInDate] = useState<string>('');
  const [checkOutDate, setCheckOutDate] = useState<string>('');
  const [guests, setGuests] = useState(2);
  const [dateError, setDateError] = useState<string>('');

  // Availability checking state
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [datesUnavailable, setDatesUnavailable] = useState(false);
  const [unavailableDatesList, setUnavailableDatesList] = useState<string[]>([]);

  // Pricing state
  const [fetchingPricing, setFetchingPricing] = useState(false);
  const [dynamicPrice, setDynamicPrice] = useState<number | null>(null);
  const [dynamicTotal, setDynamicTotal] = useState<number | null>(null);

  // Calendar modal state
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Set default dates on mount (client-side only)
  useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    const defaultCheckOut = addDays(tomorrow, minStay);
    setCheckInDate(format(tomorrow, 'yyyy-MM-dd'));
    setCheckOutDate(format(defaultCheckOut, 'yyyy-MM-dd'));
  }, [minStay]);

  // Calculate nights automatically
  const calculateNights = (): number => {
    if (!checkInDate || !checkOutDate) return minStay;

    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const nights = differenceInDays(checkOut, checkIn);
      return Math.max(0, nights);
    } catch (e) {
      return minStay;
    }
  };

  const nights = calculateNights();

  // Validate dates whenever they change
  useEffect(() => {
    if (!checkInDate || !checkOutDate) {
      setDateError('');
      return;
    }

    try {
      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);
      const calculatedNights = differenceInDays(checkOut, checkIn);

      if (calculatedNights < 0) {
        setDateError(t('dateError') || 'Check-out must be after check-in');
      } else if (calculatedNights < minStay) {
        setDateError(t('minStayError') || `Minimum stay is ${minStay} nights`);
      } else if (calculatedNights === 0) {
        setDateError(t('sameDay') || 'Same-day bookings are not allowed');
      } else {
        setDateError('');
      }
    } catch (e) {
      setDateError('');
    }
  }, [checkInDate, checkOutDate, minStay, t]);

  // Check real-time availability when dates change
  useEffect(() => {
    async function checkDatesAvailability() {
      // Reset availability state
      setAvailabilityError('');
      setDatesUnavailable(false);
      setUnavailableDatesList([]);

      // Only check if we have valid dates
      if (!checkInDate || !checkOutDate || dateError) {
        return;
      }

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      // Don't check if dates are invalid
      if (checkOut <= checkIn) {
        return;
      }

      console.log('[BookingWidget] Checking availability for:', {
        propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
      });

      setCheckingAvailability(true);

      try {
        const result = await checkAvailability(propertyId, checkIn, checkOut);

        if (result.error) {
          // API error occurred but graceful fallback
          console.warn('[BookingWidget] Availability check warning:', result.error);
          setAvailabilityError(result.error);
        }

        if (!result.available) {
          setDatesUnavailable(true);
          setUnavailableDatesList(result.unavailableDates);
          console.log('[BookingWidget] Dates unavailable:', result.unavailableDates);
        } else {
          console.log('[BookingWidget] Dates available');
        }
      } catch (error) {
        console.error('[BookingWidget] Error checking availability:', error);
        // Graceful fallback - show warning but don't block
        setAvailabilityError('Unable to verify availability. Please contact us if you experience issues.');
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkDatesAvailability();
  }, [propertyId, checkInDate, checkOutDate, dateError]);

  // Fetch real-time pricing when dates or guests change
  useEffect(() => {
    async function fetchRealTimePricing() {
      // Reset pricing state
      setDynamicPrice(null);
      setDynamicTotal(null);

      // Only fetch if we have valid dates
      if (!checkInDate || !checkOutDate || dateError || nights < minStay) {
        return;
      }

      const checkIn = new Date(checkInDate);
      const checkOut = new Date(checkOutDate);

      // Don't fetch if dates are invalid
      if (checkOut <= checkIn) {
        return;
      }

      console.log('[BookingWidget] Fetching real-time pricing for:', {
        propertyId,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
      });

      setFetchingPricing(true);

      try {
        const response = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            propertyKey: propertyId,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests,
            hasPet: false,
          }),
        });

        if (!response.ok) {
          console.warn('[BookingWidget] Pricing API error:', response.status);
          // Use fallback pricing
          return;
        }

        const pricing = await response.json();
        console.log('[BookingWidget] Real-time pricing received:', pricing);

        // Update dynamic pricing
        setDynamicPrice(pricing.basePrice);
        setDynamicTotal(pricing.total);
      } catch (error) {
        console.error('[BookingWidget] Error fetching pricing:', error);
        // Gracefully fall back to hardcoded prices
      } finally {
        setFetchingPricing(false);
      }
    }

    fetchRealTimePricing();
  }, [propertyId, checkInDate, checkOutDate, guests, dateError, nights, minStay]);

  const calculateTotal = () => {
    // Use dynamic total if available, otherwise calculate from base price
    if (dynamicTotal !== null && !fetchingPricing) {
      return dynamicTotal;
    }
    const nightsTotal = basePrice * nights;
    const total = nightsTotal + cleaningFee;
    return total;
  };

  // Use dynamic price if available, otherwise use base price
  const displayPrice = (dynamicPrice !== null && !fetchingPricing) ? dynamicPrice : basePrice;
  const nightsTotal = displayPrice * nights;
  const total = calculateTotal();

  // Handle calendar modal date confirmation
  const handleDatesConfirmed = (checkIn: string, checkOut: string) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  return (
    <div id="booking-widget" className="sticky top-24">
      <Card variant="elevated" padding="md">
        <CardContent>
          <div className="space-y-6">
            {/* Price Display */}
            <div className="text-center pb-6 border-b border-neutral-200">
              <div className="flex items-baseline justify-center gap-2 mb-2">
                {fetchingPricing ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                    <span className="text-sm text-neutral-500">{t('calculatingPrice') || 'Calculating...'}</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-primary-600">€{displayPrice}</span>
                    <span className="text-neutral-600">/ {t('perNight')}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-neutral-600">
                {dynamicPrice !== null && !fetchingPricing
                  ? (t('realTimePrice') || 'Real-time pricing from Guestly')
                  : t('priceSubtext')}
              </p>
            </div>

            {/* Date Pickers - Click anywhere to open calendar modal */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('checkIn')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-lg hover:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left relative bg-white cursor-pointer transition-colors"
                >
                  <CalendarIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <span className={checkInDate ? 'text-neutral-900' : 'text-neutral-500'}>
                    {checkInDate
                      ? format(new Date(checkInDate), locale === 'de' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')
                      : (t('selectDate') || 'Select date')}
                  </span>
                  <CalendarIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('checkOut')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-lg hover:border-primary-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left relative bg-white cursor-pointer transition-colors"
                >
                  <CalendarIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                  <span className={checkOutDate ? 'text-neutral-900' : 'text-neutral-500'}>
                    {checkOutDate
                      ? format(new Date(checkOutDate), locale === 'de' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')
                      : (t('selectDate') || 'Select date')}
                  </span>
                  <CalendarIcon size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                </button>
              </div>

              {/* Nights Display - Auto-calculated */}
              {checkInDate && checkOutDate && nights > 0 && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-primary-900">
                      {t('nightsCalculated') || 'Nights'}
                    </span>
                    <span className="text-lg font-bold text-primary-600">
                      {nights} {nights === 1 ? t('night') : t('nightsPlural')}
                    </span>
                  </div>
                </div>
              )}

              {/* Availability Check Status */}
              {checkingAvailability && checkInDate && checkOutDate && !dateError && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <p className="text-sm text-blue-900 font-medium">
                      {t('checkingAvailability') || 'Checking availability...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Date Error Display */}
              {dateError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-medium">{dateError}</p>
                </div>
              )}

              {/* Dates Unavailable Warning */}
              {datesUnavailable && !checkingAvailability && !dateError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 font-medium">
                    <strong>{t('datesUnavailable') || 'Dates Unavailable:'}</strong>
                    {' '}
                    {t('datesUnavailableMessage') || 'The selected dates are not available for booking.'}
                  </p>
                  {unavailableDatesList.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">
                      {t('unavailable') || 'Unavailable'}: {formatUnavailableDates(unavailableDatesList)}
                    </p>
                  )}
                </div>
              )}

              {/* Availability Error Warning */}
              {availabilityError && !datesUnavailable && !checkingAvailability && !dateError && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>{t('notice') || 'Notice:'}</strong> {availabilityError}
                  </p>
                </div>
              )}

              {/* Guests */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  {t('guests')}
                </label>
                <div className="relative">
                  <select
                    value={guests}
                    onChange={(e) => setGuests(Number(e.target.value))}
                    className="w-full px-4 py-3 pl-10 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none"
                  >
                    {Array.from({ length: guestLimit }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? t('guest') : t('guestsPlural')}
                      </option>
                    ))}
                  </select>
                  <UsersIcon
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  />
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-3 pt-6 border-t border-neutral-200">
              {fetchingPricing ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mr-2"></div>
                  <span className="text-sm text-neutral-600">{t('calculatingPricing') || 'Calculating pricing...'}</span>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between text-neutral-700">
                    <span>€{displayPrice} × {nights} {nights === 1 ? t('night') : t('nightsPlural')}</span>
                    <span className="font-semibold">€{nightsTotal}</span>
                  </div>
                  {dynamicTotal === null && (
                    <div className="flex items-center justify-between text-neutral-700">
                      <span>{t('cleaningFee')}</span>
                      <span className="font-semibold">€{cleaningFee}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-lg font-bold text-neutral-900 pt-3 border-t border-neutral-200">
                    <span>{t('total')}</span>
                    <span>€{Math.round(total)}</span>
                  </div>
                  {dynamicTotal !== null && (
                    <p className="text-xs text-neutral-500 text-center">
                      {t('includesAllFees') || 'Includes all fees and taxes'}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Reserve Button */}
            <Link
              href={`/booking?propertyId=${propertyId}&checkIn=${checkInDate}&checkOut=${checkOutDate}&guests=${guests}`}
              className={
                dateError || !checkInDate || !checkOutDate || checkingAvailability || datesUnavailable
                  ? 'pointer-events-none opacity-50'
                  : ''
              }
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={
                  !!dateError || !checkInDate || !checkOutDate || checkingAvailability || datesUnavailable
                }
              >
                {checkingAvailability
                  ? (t('checkingAvailability') || 'Checking availability...')
                  : datesUnavailable
                  ? (t('datesUnavailable') || 'Dates unavailable')
                  : (t('reserve') || 'Reserve')}
              </Button>
            </Link>

            <p className="text-xs text-center text-neutral-600">
              {t('chargeNotice')}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        propertyId={propertyId}
        initialCheckIn={checkInDate}
        initialCheckOut={checkOutDate}
        onDatesConfirmed={handleDatesConfirmed}
        locale={locale}
      />
    </div>
  );
};

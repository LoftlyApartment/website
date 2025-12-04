'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { format } from 'date-fns';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { step1Schema, Step1Data } from '../../lib/validation/booking';
import { useBooking } from '../../lib/context/BookingContext';
import { PROPERTIES, formatPrice } from '../../lib/utils/booking';
import { checkAvailability, formatUnavailableDates } from '../../lib/utils/availability';
import { CalendarIcon, UsersIcon, PawIcon } from '../ui/Icons';
import { CalendarModal } from './CalendarModal';
import clsx from 'clsx';

export function Step1PropertyDates() {
  const t = useTranslations('booking.step1');
  const locale = useLocale();
  const { state, updateStep1, calculatePricing, nextStep } = useBooking();
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string>('');
  const [datesUnavailable, setDatesUnavailable] = useState(false);
  const [unavailableDatesList, setUnavailableDatesList] = useState<string[]>([]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      ...state.step1,
      specialRequests: state.step1.specialRequests || {
        earlyCheckIn: false,
        lateCheckout: false,
        airportPickup: false,
        pet: false,
      },
    },
  });

  // Update form when context state changes (from URL parameters)
  useEffect(() => {
    console.log('[STEP1] Context state changed, resetting form with:', state.step1);
    reset({
      ...state.step1,
      specialRequests: state.step1.specialRequests || {
        earlyCheckIn: false,
        lateCheckout: false,
        airportPickup: false,
        pet: false,
      },
    });
  }, [state.step1, reset]);

  const selectedPropertyId = watch('propertyId');
  const adults = watch('adults') || 1;
  const children = watch('children') || 0;
  const infants = watch('infants') || 0;
  const pet = watch('specialRequests.pet') || false;
  const checkInDate = watch('checkInDate');
  const checkOutDate = watch('checkOutDate');

  const selectedProperty = selectedPropertyId ? PROPERTIES[selectedPropertyId] : null;

  // Debug logging for propertyId
  useEffect(() => {
    console.log('[STEP1] Current propertyId in form:', selectedPropertyId);
    console.log('[STEP1] Available properties:', Object.keys(PROPERTIES));
    console.log('[STEP1] Selected property object:', selectedProperty);
  }, [selectedPropertyId, selectedProperty]);

  // Debug logging for form state
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const nights = Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log('Form state changed:', {
        checkInDate: checkInDate.toISOString(),
        checkOutDate: checkOutDate.toISOString(),
        nights,
        isValid,
        hasErrors: Object.keys(errors).length > 0,
        errors,
      });
    }
  }, [checkInDate, checkOutDate, errors, isValid]);

  // Calculate nights for display
  const calculateNightsDisplay = () => {
    if (!checkInDate || !checkOutDate) return 0;
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((checkOutDate.getTime() - checkInDate.getTime()) / msPerDay);
  };

  // Check guest count warning
  useEffect(() => {
    if (selectedProperty && adults + children > selectedProperty.maxGuests) {
      setShowGuestWarning(true);
    } else {
      setShowGuestWarning(false);
    }
  }, [selectedProperty, adults, children]);

  // If pet selected but property doesn't allow pets, uncheck it
  useEffect(() => {
    if (pet && selectedProperty && !selectedProperty.petFriendly) {
      setValue('specialRequests.pet', false);
    }
  }, [selectedProperty, pet, setValue]);

  // Check availability when dates and property change
  useEffect(() => {
    async function checkDatesAvailability() {
      // Reset availability state
      setAvailabilityError('');
      setDatesUnavailable(false);
      setUnavailableDatesList([]);

      // Only check if we have all required data
      if (!selectedPropertyId || !checkInDate || !checkOutDate) {
        return;
      }

      // Validate dates first
      if (checkOutDate <= checkInDate) {
        return;
      }

      console.log('[Step1] Checking availability for:', {
        propertyId: selectedPropertyId,
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
      });

      setCheckingAvailability(true);

      try {
        const result = await checkAvailability(
          selectedPropertyId,
          checkInDate,
          checkOutDate
        );

        if (result.error) {
          // API error occurred but we're doing graceful fallback
          console.warn('[Step1] Availability check warning:', result.error);
          setAvailabilityError(result.error);
        }

        if (!result.available) {
          setDatesUnavailable(true);
          setUnavailableDatesList(result.unavailableDates);
          console.log('[Step1] Dates unavailable:', result.unavailableDates);
        } else {
          console.log('[Step1] Dates available');
        }

      } catch (error) {
        console.error('[Step1] Error checking availability:', error);
        // Graceful fallback - don't block user, but show warning
        setAvailabilityError('Unable to verify availability. Please contact us if you experience issues.');
      } finally {
        setCheckingAvailability(false);
      }
    }

    checkDatesAvailability();
  }, [selectedPropertyId, checkInDate, checkOutDate]);

  const onSubmit = (data: Step1Data) => {
    updateStep1(data);
    calculatePricing();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Property Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('selectProperty')}</CardTitle>
        </CardHeader>
        <CardContent>
          <Controller
            name="propertyId"
            control={control}
            render={({ field }) => (
              <div className="grid md:grid-cols-2 gap-4">
                {Object.values(PROPERTIES).map((property) => (
                  <button
                    key={property.slug}
                    type="button"
                    onClick={() => field.onChange(property.slug)}
                    className={clsx(
                      'relative p-4 rounded-lg border-2 transition-all text-left',
                      field.value === property.slug
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                    )}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg">{property.name}</h3>
                      {field.value === property.slug && (
                        <div className="w-6 h-6 rounded-full bg-primary-600 text-white flex items-center justify-center">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path
                              d="M13.3 4L6 11.3L2.7 8"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-neutral-600">
                      <p>{t('maxGuests')}: {property.maxGuests}</p>
                      <p className="text-lg font-bold text-primary-600">
                        {formatPrice(property.basePrice)} <span className="text-sm font-normal">{t('perNight')}</span>
                      </p>
                      {property.petFriendly && (
                        <p className="flex items-center gap-1 text-primary-600">
                          <PawIcon size={16} /> {t('petFriendly')}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          />
          {errors.propertyId && (
            <p className="mt-2 text-sm text-red-600">{errors.propertyId.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Date Selection */}
      <Card>
        <CardHeader>
          <CardTitle>{t('selectDates')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Check-in Date Button */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-luxury-charcoal-800">
                {t('checkIn')}
              </label>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className={clsx(
                  'w-full px-4 py-2 pl-10 rounded-lg border transition-all duration-200 text-left relative bg-white cursor-pointer',
                  errors.checkInDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-luxury-beige-300 hover:border-luxury-beige-600 focus:border-luxury-beige-600 focus:ring-luxury-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-1'
                )}
              >
                <CalendarIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-charcoal-600" />
                <span className={checkInDate ? 'text-luxury-charcoal-800' : 'text-luxury-charcoal-500'}>
                  {checkInDate
                    ? format(checkInDate, locale === 'de' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')
                    : (locale === 'de' ? 'Datum wählen' : 'Select date')}
                </span>
              </button>
              {errors.checkInDate && (
                <p className="text-sm text-red-600">{errors.checkInDate.message}</p>
              )}
            </div>

            {/* Check-out Date Button */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-luxury-charcoal-800">
                {t('checkOut')}
              </label>
              <button
                type="button"
                onClick={() => setIsCalendarOpen(true)}
                className={clsx(
                  'w-full px-4 py-2 pl-10 rounded-lg border transition-all duration-200 text-left relative bg-white cursor-pointer',
                  errors.checkOutDate
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-luxury-beige-300 hover:border-luxury-beige-600 focus:border-luxury-beige-600 focus:ring-luxury-gold-500/20 focus:outline-none focus:ring-2 focus:ring-offset-1'
                )}
              >
                <CalendarIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-charcoal-600" />
                <span className={checkOutDate ? 'text-luxury-charcoal-800' : 'text-luxury-charcoal-500'}>
                  {checkOutDate
                    ? format(checkOutDate, locale === 'de' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')
                    : (locale === 'de' ? 'Datum wählen' : 'Select date')}
                </span>
              </button>
              {errors.checkOutDate && (
                <p className="text-sm text-red-600">
                  {errors.checkOutDate.message?.startsWith('booking.step1.errors.')
                    ? t(errors.checkOutDate.message.replace('booking.step1.', '') as any)
                    : errors.checkOutDate.message}
                </p>
              )}
              {!errors.checkOutDate && (
                <p className="text-sm text-luxury-charcoal-600">{t('minStay')}</p>
              )}
            </div>
          </div>
          {checkInDate && checkOutDate && (
            <div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-900 font-medium">
                {calculateNightsDisplay()} {calculateNightsDisplay() === 1 ? 'Nacht' : 'Nächte'} ausgewählt
                {calculateNightsDisplay() < 3 && (
                  <span className="text-red-600 ml-2">(Mindestens 3 Nächte erforderlich)</span>
                )}
              </p>
            </div>
          )}

          {/* Availability Check Status */}
          {checkingAvailability && checkInDate && checkOutDate && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <p className="text-sm text-blue-900 font-medium">
                  Checking availability...
                </p>
              </div>
            </div>
          )}

          {/* Dates Unavailable Warning */}
          {datesUnavailable && !checkingAvailability && (
            <Alert variant="error">
              <strong>Dates Unavailable:</strong> The selected dates are not available for booking.
              {unavailableDatesList.length > 0 && (
                <span className="block mt-1 text-sm">
                  Unavailable: {formatUnavailableDates(unavailableDatesList)}
                </span>
              )}
              <span className="block mt-1 text-sm">
                Please select different dates.
              </span>
            </Alert>
          )}

          {/* Availability Error Warning */}
          {availabilityError && !datesUnavailable && !checkingAvailability && (
            <Alert variant="warning">
              <strong>Notice:</strong> {availabilityError}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Guest Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon size={24} />
            {t('selectGuests')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">{t('adults')}</label>
                <p className="text-sm text-neutral-600">{t('adultsDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('adults', Math.max(1, adults - 1))}
                  disabled={adults <= 1}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{adults}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('adults', Math.min(5, adults + 1))}
                  disabled={adults >= 5}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">{t('children')}</label>
                <p className="text-sm text-neutral-600">{t('childrenDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('children', Math.max(0, children - 1))}
                  disabled={children <= 0}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{children}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('children', Math.min(3, children + 1))}
                  disabled={children >= 3}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium">{t('infants')}</label>
                <p className="text-sm text-neutral-600">{t('infantsDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('infants', Math.max(0, infants - 1))}
                  disabled={infants <= 0}
                >
                  -
                </Button>
                <span className="w-8 text-center font-medium">{infants}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setValue('infants', Math.min(2, infants + 1))}
                  disabled={infants >= 2}
                >
                  +
                </Button>
              </div>
            </div>

            {showGuestWarning && selectedProperty && (
              <Alert variant="warning">
                {t('guestWarning', { max: selectedProperty.maxGuests })}
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Special Requests */}
      <Card>
        <CardHeader>
          <CardTitle>{t('specialRequests')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Controller
              name="specialRequests.earlyCheckIn"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span>{t('earlyCheckIn')}</span>
                </label>
              )}
            />

            <Controller
              name="specialRequests.lateCheckout"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span>{t('lateCheckout')}</span>
                </label>
              )}
            />

            <Controller
              name="specialRequests.airportPickup"
              control={control}
              render={({ field }) => (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                  />
                  <span>{t('airportPickup')}</span>
                </label>
              )}
            />

            {selectedProperty?.petFriendly && (
              <Controller
                name="specialRequests.pet"
                control={control}
                render={({ field }) => (
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="w-5 h-5 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="flex items-center gap-2">
                      <PawIcon size={18} />
                      {t('pet')} <span className="text-neutral-600">({formatPrice(selectedProperty.petFee)})</span>
                    </span>
                  </label>
                )}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={!isValid || showGuestWarning || checkingAvailability || datesUnavailable}
        >
          {checkingAvailability ? 'Checking availability...' : t('continue')}
        </Button>
      </div>

      {/* Calendar Modal */}
      <CalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        propertyId={selectedPropertyId || 'kantstrasse'}
        initialCheckIn={checkInDate ? format(checkInDate, 'yyyy-MM-dd') : ''}
        initialCheckOut={checkOutDate ? format(checkOutDate, 'yyyy-MM-dd') : ''}
        onDatesConfirmed={(checkIn, checkOut) => {
          // Parse dates and update form
          const [checkInYear, checkInMonth, checkInDay] = checkIn.split('-').map(Number);
          const [checkOutYear, checkOutMonth, checkOutDay] = checkOut.split('-').map(Number);
          setValue('checkInDate', new Date(checkInYear, checkInMonth - 1, checkInDay));
          setValue('checkOutDate', new Date(checkOutYear, checkOutMonth - 1, checkOutDay));
        }}
        locale={locale}
      />
    </form>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { useBooking } from '../../lib/context/BookingContext';
import { PROPERTIES, formatPrice } from '../../lib/utils/booking';
import { CheckIcon, MailIcon, HomeIcon, CalendarIcon, UsersIcon, ClockIcon } from '../ui/Icons';

export function Step5Confirmation() {
  const t = useTranslations('booking.step5');
  const locale = useLocale();
  const router = useRouter();
  const { state, resetBooking } = useBooking();

  const { step1, step2, pricing, bookingReference } = state;
  const property = step1.propertyId ? PROPERTIES[step1.propertyId] : null;

  const dateLocale = locale === 'de' ? de : enUS;

  // State for loaded booking data from database
  const [loadedBooking, setLoadedBooking] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch booking from database if we only have a reference
  useEffect(() => {
    // If we have a booking reference but no property/pricing, fetch from database
    if (bookingReference && (!property || !pricing)) {
      setLoading(true);

      fetch(`/api/bookings/${bookingReference}`)
        .then(res => res.json())
        .then(data => {
          if (data.booking) {
            setLoadedBooking(data.booking);
          }
        })
        .catch(err => {
          console.error('Error loading booking:', err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [bookingReference, property, pricing]);

  // Clear booking state after 10 minutes
  useEffect(() => {
    const timer = setTimeout(() => {
      resetBooking();
    }, 10 * 60 * 1000);

    return () => clearTimeout(timer);
  }, [resetBooking]);

  const handleBookAnother = () => {
    resetBooking();
    router.push('/properties');
  };

  const handleGoHome = () => {
    resetBooking();
    router.push('/');
  };

  // Show loading state
  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-neutral-600">{t('loading', { default: 'Loading booking details...' })}</p>
      </div>
    );
  }

  // Use either context data or loaded booking data
  const bookingData = loadedBooking ? {
    property: loadedBooking.properties,
    step1: {
      propertyId: loadedBooking.properties?.slug,
      checkInDate: new Date(loadedBooking.check_in_date),
      checkOutDate: new Date(loadedBooking.check_out_date),
      adults: loadedBooking.adults,
      children: loadedBooking.children,
      infants: loadedBooking.infants,
    },
    step2: {
      email: loadedBooking.guest_email,
      firstName: loadedBooking.guest_first_name,
      lastName: loadedBooking.guest_last_name,
    },
    pricing: {
      nights: loadedBooking.nights,
      basePrice: parseFloat(loadedBooking.base_price),
      discount: parseFloat(loadedBooking.discount || '0'),
      cleaningFee: parseFloat(loadedBooking.cleaning_fee),
      petFee: parseFloat(loadedBooking.pet_fee || '0'),
      subtotal: parseFloat(loadedBooking.subtotal),
      vat: parseFloat(loadedBooking.vat),
      total: parseFloat(loadedBooking.total),
    },
    bookingReference: loadedBooking.booking_reference,
  } : {
    property,
    step1,
    step2,
    pricing,
    bookingReference,
  };

  // Validate we have the minimum required data
  if (!bookingData.property || !bookingData.bookingReference) {
    return (
      <Alert variant="error">
        <p>{t('errorNoBooking')}</p>
      </Alert>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Success Animation & Message */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4 animate-bounce">
          <CheckIcon size={40} className="text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t('title')}</h1>
        <p className="text-lg text-neutral-600">{t('subtitle')}</p>
      </div>

      {/* Booking Reference */}
      <Card variant="elevated">
        <CardContent className="text-center py-6">
          <p className="text-sm text-neutral-600 mb-2">{t('bookingReference')}</p>
          <p className="text-3xl font-mono font-bold text-primary-600">{bookingData.bookingReference}</p>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HomeIcon size={24} />
            {t('bookingDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Property */}
            <div>
              <h3 className="text-xl font-semibold mb-1">{bookingData.property.name}</h3>
              <p className="text-neutral-600">{t('propertyAddress', { property: bookingData.property.slug || bookingData.property.id })}</p>
            </div>

            {/* Check-in */}
            <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
              <CalendarIcon size={24} className="text-primary-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">{t('checkIn')}</p>
                <p className="text-lg">
                  {bookingData.step1.checkInDate && format(bookingData.step1.checkInDate, 'PPP', { locale: dateLocale })}
                </p>
                <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                  <ClockIcon size={16} />
                  {t('checkInTime')}
                </p>
              </div>
            </div>

            {/* Check-out */}
            <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
              <CalendarIcon size={24} className="text-primary-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">{t('checkOut')}</p>
                <p className="text-lg">
                  {bookingData.step1.checkOutDate && format(bookingData.step1.checkOutDate, 'PPP', { locale: dateLocale })}
                </p>
                <p className="text-sm text-neutral-600 flex items-center gap-1 mt-1">
                  <ClockIcon size={16} />
                  {t('checkOutTime')}
                </p>
              </div>
            </div>

            {/* Guests */}
            <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
              <UsersIcon size={24} className="text-primary-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">{t('guests')}</p>
                <p>
                  {bookingData.step1.adults} {bookingData.step1.adults === 1 ? t('adult') : t('adults')}
                  {(bookingData.step1.children || 0) > 0 && `, ${bookingData.step1.children} ${bookingData.step1.children === 1 ? t('child') : t('children')}`}
                  {(bookingData.step1.infants || 0) > 0 && `, ${bookingData.step1.infants} ${bookingData.step1.infants === 1 ? t('infant') : t('infants')}`}
                </p>
              </div>
            </div>

            {/* Total Paid */}
            <div className="border-t-2 border-neutral-300 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">{t('totalPaid')}</span>
                <span className="text-2xl font-bold text-primary-600">
                  {bookingData.pricing && formatPrice(bookingData.pricing.total, locale)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>{t('nextSteps')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">{t('step1Title')}</p>
                <p className="text-sm text-neutral-600">{t('step1Desc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">{t('step2Title')}</p>
                <p className="text-sm text-neutral-600">{t('step2Desc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">{t('step3Title')}</p>
                <p className="text-sm text-neutral-600">{t('step3Desc')}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <p className="font-semibold mb-1">{t('step4Title')}</p>
                <p className="text-sm text-neutral-600">{t('step4Desc')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Confirmation */}
      <Alert variant="success">
        <div className="flex items-start gap-3">
          <MailIcon size={20} className="mt-0.5" />
          <p>
            {t('emailSent')} <span className="font-semibold">{bookingData.step2.email}</span>
          </p>
        </div>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Button variant="primary" size="lg" onClick={handleBookAnother}>
          {t('bookAnother')}
        </Button>
        <Button variant="outline" size="lg" onClick={handleGoHome}>
          {t('returnHome')}
        </Button>
      </div>
    </div>
  );
}

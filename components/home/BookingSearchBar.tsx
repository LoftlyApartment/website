'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { CalendarIcon, SearchIcon } from '@/components/ui/Icons';
import { Card } from '@/components/ui/Card';
import { CalendarModal } from '@/components/booking/CalendarModal';

export const BookingSearchBar = () => {
  const t = useTranslations('home.search');
  const locale = useLocale();
  const router = useRouter();

  const [location, setLocation] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const locationOptions = [
    { value: '', label: t('allProperties') },
    { value: 'kantstrasse', label: 'Kantstrasse 99' },
    { value: 'hindenburgdamm', label: 'Hindenburgdamm 85' },
    { value: 'kottbusserdamm', label: 'Kottbusser Damm 68' }
  ];

  const guestOptions = [
    { value: '1', label: '1 ' + t('guest') },
    { value: '2', label: '2 ' + t('guests') },
    { value: '3', label: '3 ' + t('guests') },
    { value: '4', label: '4 ' + t('guests') },
    { value: '5', label: '5 ' + t('guests') },
    { value: '6', label: '6 ' + t('guests') },
    { value: '7', label: '7 ' + t('guests') }
  ];

  const handleSearch = () => {
    // Build query params
    const params = new URLSearchParams();
    if (location) params.set('location', location);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests) params.set('guests', guests);

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <section className="py-12 -mt-24 relative z-10">
      <div className="container mx-auto px-4">
        <Card variant="elevated" padding="lg" className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Location */}
            <div className="lg:col-span-1">
              <Select
                label={t('location')}
                options={locationOptions}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                fullWidth
              />
            </div>

            {/* Check-in */}
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-luxury-charcoal-800">
                  {t('checkIn')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-luxury-beige-300 hover:border-luxury-beige-600 transition-all duration-200 text-left relative bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-luxury-gold-500/20 focus:border-luxury-beige-600"
                >
                  <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-charcoal-600" />
                  <span className={checkIn ? 'text-luxury-charcoal-800' : 'text-luxury-charcoal-500'}>
                    {checkIn
                      ? format(new Date(checkIn), locale === 'de' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')
                      : (locale === 'de' ? 'Datum wählen' : 'Select date')}
                  </span>
                </button>
              </div>
            </div>

            {/* Check-out */}
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-1 w-full">
                <label className="text-sm font-medium text-luxury-charcoal-800">
                  {t('checkOut')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCalendarOpen(true)}
                  className="w-full px-4 py-2 pl-10 rounded-lg border border-luxury-beige-300 hover:border-luxury-beige-600 transition-all duration-200 text-left relative bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-luxury-gold-500/20 focus:border-luxury-beige-600"
                >
                  <CalendarIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-luxury-charcoal-600" />
                  <span className={checkOut ? 'text-luxury-charcoal-800' : 'text-luxury-charcoal-500'}>
                    {checkOut
                      ? format(new Date(checkOut), locale === 'de' ? 'dd.MM.yyyy' : 'MM/dd/yyyy')
                      : (locale === 'de' ? 'Datum wählen' : 'Select date')}
                  </span>
                </button>
              </div>
            </div>

            {/* Guests */}
            <div className="lg:col-span-1">
              <Select
                label={t('guestsLabel')}
                options={guestOptions}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                fullWidth
              />
            </div>

            {/* Search Button */}
            <div className="lg:col-span-1 flex items-end">
              <Button
                onClick={handleSearch}
                fullWidth
                size="lg"
                icon={<SearchIcon size={20} />}
                className="h-[42px]"
              >
                {t('search')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Calendar Modal */}
        <CalendarModal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          propertyId={location || 'kantstrasse'}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          onDatesConfirmed={(newCheckIn, newCheckOut) => {
            setCheckIn(newCheckIn);
            setCheckOut(newCheckOut);
          }}
          locale={locale}
        />
      </div>
    </section>
  );
};

'use client';

import { useState, useEffect } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  isAfter,
  isBefore,
  startOfDay,
  differenceInDays,
  parse,
} from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { getBlockedDates } from '@/lib/utils/availability';

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  initialCheckIn: string | null;
  initialCheckOut: string | null;
  onDatesConfirmed: (checkIn: string, checkOut: string) => void;
  locale?: string;
}

// Weekday headers for different locales
const WEEKDAYS = {
  de: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
  en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'],
};

export const CalendarModal: React.FC<CalendarModalProps> = ({
  isOpen,
  onClose,
  propertyId,
  initialCheckIn,
  initialCheckOut,
  onDatesConfirmed,
  locale = 'en',
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<Date | null>(
    initialCheckIn ? parse(initialCheckIn, 'yyyy-MM-dd', new Date()) : null
  );
  const [selectedCheckOut, setSelectedCheckOut] = useState<Date | null>(
    initialCheckOut ? parse(initialCheckOut, 'yyyy-MM-dd', new Date()) : null
  );
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Session-based caching state
  const [cachedBlockedDates, setCachedBlockedDates] = useState<string[]>([]);
  const [availabilityFetched, setAvailabilityFetched] = useState(false);
  const [fetchingAvailability, setFetchingAvailability] = useState(false);

  const dateLocale = locale === 'de' ? de : enUS;

  // Fetch 6 months of availability ONCE when modal opens (session-based caching)
  useEffect(() => {
    async function fetchAvailabilityForSession() {
      // Don't fetch if modal is closed, already fetched, or currently fetching
      if (!isOpen || availabilityFetched || fetchingAvailability) return;

      setFetchingAvailability(true);
      setIsLoading(true);

      try {
        // Fetch 6 months of availability from today
        const today = new Date();
        const sixMonthsLater = addMonths(today, 6);

        console.log('[CalendarModal] Fetching 6 months of availability for session...');
        const blocked = await getBlockedDates(propertyId, today, sixMonthsLater);

        console.log(`[CalendarModal] Cached ${blocked.length} blocked dates for session`);
        setCachedBlockedDates(blocked);
        setBlockedDates(blocked); // Set initial blocked dates for display
        setAvailabilityFetched(true);
      } catch (error) {
        console.error('[CalendarModal] Error fetching availability:', error);
        // Fail gracefully - empty array means all dates appear available
        setCachedBlockedDates([]);
        setBlockedDates([]);
        setAvailabilityFetched(true);
      } finally {
        setFetchingAvailability(false);
        setIsLoading(false);
      }
    }

    fetchAvailabilityForSession();
  }, [isOpen, propertyId, availabilityFetched, fetchingAvailability]);

  // Reset cache when modal closes so next open gets fresh data
  useEffect(() => {
    if (!isOpen) {
      setAvailabilityFetched(false);
      setCachedBlockedDates([]);
      setBlockedDates([]);
    }
  }, [isOpen]);

  // Use cached data for month navigation (no API calls)
  useEffect(() => {
    if (availabilityFetched && cachedBlockedDates.length >= 0) {
      // Month navigation uses cached data - instant, no API calls
      setBlockedDates(cachedBlockedDates);
    }
  }, [currentMonth, availabilityFetched, cachedBlockedDates]);

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');

    // Check if date is blocked
    if (blockedDates.includes(dateStr)) {
      return;
    }

    // If no check-in selected yet, set as check-in
    if (!selectedCheckIn) {
      setSelectedCheckIn(date);
      setSelectedCheckOut(null);
      return;
    }

    // If check-in selected but no check-out, set as check-out
    if (selectedCheckIn && !selectedCheckOut) {
      if (isAfter(date, selectedCheckIn)) {
        // Check if any blocked dates exist in the range
        const datesInRange = eachDayOfInterval({
          start: selectedCheckIn,
          end: date,
        });

        const hasBlockedInRange = datesInRange.some((d) => {
          const dStr = format(d, 'yyyy-MM-dd');
          return blockedDates.includes(dStr);
        });

        if (hasBlockedInRange) {
          // Reset and set new check-in
          setSelectedCheckIn(date);
          setSelectedCheckOut(null);
        } else {
          setSelectedCheckOut(date);
        }
      } else {
        // If clicked date is before check-in, reset and set as new check-in
        setSelectedCheckIn(date);
        setSelectedCheckOut(null);
      }
      return;
    }

    // If both selected, reset and start over
    setSelectedCheckIn(date);
    setSelectedCheckOut(null);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleReset = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  const handleConfirm = () => {
    if (selectedCheckIn && selectedCheckOut) {
      onDatesConfirmed(
        format(selectedCheckIn, 'yyyy-MM-dd'),
        format(selectedCheckOut, 'yyyy-MM-dd')
      );
      onClose();
    }
  };

  const handleClearCheckIn = () => {
    setSelectedCheckIn(null);
    setSelectedCheckOut(null);
  };

  const handleClearCheckOut = () => {
    setSelectedCheckOut(null);
  };

  const calculateNights = (): number => {
    if (!selectedCheckIn || !selectedCheckOut) return 0;
    return differenceInDays(selectedCheckOut, selectedCheckIn);
  };

  const isDateBlocked = (date: Date): boolean => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return blockedDates.includes(dateStr);
  };

  const isDateInRange = (date: Date): boolean => {
    if (!selectedCheckIn || !selectedCheckOut) return false;
    return isAfter(date, selectedCheckIn) && isBefore(date, selectedCheckOut);
  };

  const isDateSelected = (date: Date): boolean => {
    if (selectedCheckIn && isSameDay(date, selectedCheckIn)) return true;
    if (selectedCheckOut && isSameDay(date, selectedCheckOut)) return true;
    return false;
  };

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get the day of week for the first day (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfWeek = monthStart.getDay();
    // Adjust for Monday start (0 = Monday, 6 = Sunday)
    const startPadding = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Create padding for days before month starts
    const paddingDays = Array(startPadding).fill(null);

    return (
      <div className="flex-1 px-4">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold">
            {format(monthDate, 'MMMM yyyy', { locale: dateLocale })}
          </h3>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {(WEEKDAYS[locale as keyof typeof WEEKDAYS] || WEEKDAYS.en).map((day) => (
            <div key={day} className="text-center text-xs font-medium text-neutral-500 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {paddingDays.map((_, index) => (
            <div key={`padding-${index}`} className="aspect-square" />
          ))}
          {daysInMonth.map((date) => {
            const isBlocked = isDateBlocked(date);
            const isSelected = isDateSelected(date);
            const inRange = isDateInRange(date);
            const isPast = isBefore(startOfDay(date), startOfDay(new Date()));

            return (
              <button
                type="button"
                key={date.toISOString()}
                onClick={() => !isBlocked && !isPast && handleDateClick(date)}
                disabled={isBlocked || isPast}
                className={`
                  aspect-square flex items-center justify-center text-sm rounded-full
                  transition-colors relative
                  ${isPast ? 'text-neutral-300 cursor-not-allowed' : ''}
                  ${isBlocked && !isPast ? 'text-neutral-400 line-through cursor-not-allowed' : ''}
                  ${!isBlocked && !isPast && !isSelected && !inRange ? 'hover:bg-neutral-100 cursor-pointer' : ''}
                  ${isSelected ? 'bg-black text-white font-bold' : ''}
                  ${inRange ? 'bg-neutral-100' : ''}
                `}
              >
                {format(date, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const nights = calculateNights();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-start justify-between">
            {/* Left side - Nights and date range */}
            <div>
              <h2 className="text-2xl font-semibold text-neutral-900">
                {nights > 0 ? (
                  <>
                    {nights} {nights === 1 ? (locale === 'de' ? 'Nacht' : 'Night') : (locale === 'de' ? 'Nächte' : 'Nights')}
                  </>
                ) : (
                  locale === 'de' ? 'Datum auswählen' : 'Select dates'
                )}
              </h2>
              {selectedCheckIn && selectedCheckOut && (
                <p className="text-sm text-neutral-500 mt-1">
                  {format(selectedCheckIn, 'dd. MMM. yyyy', { locale: dateLocale })} - {format(selectedCheckOut, 'dd. MMM. yyyy', { locale: dateLocale })}
                </p>
              )}
            </div>

            {/* Right side - Check-in / Check-out boxes */}
            <div className="flex items-center gap-0">
              {/* Check-in display */}
              <div
                className={`px-4 py-3 border-2 rounded-l-lg cursor-pointer transition-colors ${
                  !selectedCheckOut && selectedCheckIn ? 'border-neutral-900' : 'border-neutral-300'
                }`}
                onClick={handleClearCheckOut}
              >
                <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                  {locale === 'de' ? 'CHECK-IN' : 'CHECK-IN'}
                </div>
                <div className="text-sm font-medium text-neutral-900">
                  {selectedCheckIn ? format(selectedCheckIn, 'dd.MM.yyyy') : (locale === 'de' ? 'Datum wählen' : 'Add date')}
                </div>
                {selectedCheckIn && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); handleClearCheckIn(); }}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-neutral-200 rounded-full text-xs hover:bg-neutral-300 hidden group-hover:flex items-center justify-center"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Check-out display */}
              <div
                className={`px-4 py-3 border-2 border-l-0 rounded-r-lg cursor-pointer transition-colors ${
                  selectedCheckIn && !selectedCheckOut ? 'border-neutral-900' : 'border-neutral-300'
                }`}
                onClick={() => selectedCheckIn && selectedCheckOut && handleClearCheckOut()}
              >
                <div className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">
                  {locale === 'de' ? 'CHECK-OUT' : 'CHECK-OUT'}
                </div>
                <div className="text-sm font-medium text-neutral-900">
                  {selectedCheckOut ? format(selectedCheckOut, 'dd.MM.yyyy') : (locale === 'de' ? 'Datum wählen' : 'Add date')}
                </div>
              </div>

              {/* Clear button */}
              {(selectedCheckIn || selectedCheckOut) && (
                <button
                  type="button"
                  onClick={handleClearCheckIn}
                  className="ml-2 p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-full transition-colors"
                  title={locale === 'de' ? 'Löschen' : 'Clear'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Calendar content */}
        <div className="p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              <span className="ml-3 text-neutral-600">
                {locale === 'de' ? 'Verfügbarkeit wird geladen...' : 'Loading availability...'}
              </span>
            </div>
          ) : (
            <>
              {/* Two months side by side with navigation */}
              <div className="flex items-start gap-8 relative">
                {/* Previous month button - positioned absolute */}
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="absolute left-0 top-0 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Calendar months */}
                {renderMonth(currentMonth)}
                {renderMonth(addMonths(currentMonth, 1))}

                {/* Next month button - positioned absolute */}
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="absolute right-0 top-0 p-2 hover:bg-neutral-100 rounded-full transition-colors z-10"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-200 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Keyboard icon hint */}
            <button type="button" className="p-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors">
              <svg className="w-5 h-5 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={1.5} />
                <line x1="6" y1="10" x2="6" y2="10" strokeWidth={2} strokeLinecap="round" />
                <line x1="10" y1="10" x2="10" y2="10" strokeWidth={2} strokeLinecap="round" />
                <line x1="14" y1="10" x2="14" y2="10" strokeWidth={2} strokeLinecap="round" />
                <line x1="18" y1="10" x2="18" y2="10" strokeWidth={2} strokeLinecap="round" />
                <line x1="8" y1="14" x2="16" y2="14" strokeWidth={1.5} strokeLinecap="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="text-sm underline text-neutral-600 hover:text-neutral-900"
            >
              {locale === 'de' ? 'Reisedaten zurücksetzen' : 'Reset dates'}
            </button>
          </div>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!selectedCheckIn || !selectedCheckOut}
            className={`
              px-6 py-3 text-sm font-semibold text-white rounded-lg transition-colors
              ${selectedCheckIn && selectedCheckOut
                ? 'bg-black hover:bg-neutral-800'
                : 'bg-neutral-300 cursor-not-allowed'}
            `}
          >
            {locale === 'de' ? 'Schließen' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

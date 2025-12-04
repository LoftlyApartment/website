'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isBefore,
  isToday,
  startOfDay,
  getDay,
} from 'date-fns';
import { de, enUS } from 'date-fns/locale';

interface PropertyCalendarProps {
  propertyId: string;
  locale?: string;
}

interface MonthCalendarProps {
  month: Date;
  blockedDates: Set<string>;
  locale: string;
  weekdayLabels: string[];
}

// Single month component
const MonthCalendar: React.FC<MonthCalendarProps> = ({
  month,
  blockedDates,
  locale,
  weekdayLabels,
}) => {
  const dateLocale = locale === 'de' ? de : enUS;
  const today = startOfDay(new Date());

  // Get all days in the month
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate offset for first day (Monday = 0, Sunday = 6)
  const firstDayOffset = (getDay(monthStart) + 6) % 7; // Convert Sunday=0 to Monday=0

  // Create empty cells for days before the first day of the month
  const emptyCells = Array(firstDayOffset).fill(null);

  return (
    <div className="flex-1 min-w-[280px]">
      {/* Month header */}
      <h3 className="text-lg font-semibold text-neutral-900 mb-4 text-center">
        {format(month, 'MMMM yyyy', { locale: dateLocale })}
      </h3>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdayLabels.map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-neutral-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for offset */}
        {emptyCells.map((_, index) => (
          <div key={`empty-${index}`} className="h-10" />
        ))}

        {/* Actual days */}
        {days.map((day) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const isPast = isBefore(day, today) && !isToday(day);
          const isBlocked = blockedDates.has(dateStr);
          const isUnavailable = isPast || isBlocked;

          return (
            <div
              key={dateStr}
              className={`
                h-10 flex items-center justify-center text-sm
                ${isToday(day) ? 'font-bold' : ''}
                ${isUnavailable ? 'text-neutral-300' : 'text-neutral-900 font-medium'}
              `}
            >
              <span
                className={`
                  relative
                  ${isBlocked && !isPast ? 'line-through decoration-neutral-400 decoration-1' : ''}
                `}
              >
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const PropertyCalendar: React.FC<PropertyCalendarProps> = ({
  propertyId,
  locale = 'en',
}) => {
  const t = useTranslations('property.calendar');
  const [currentDate, setCurrentDate] = useState(() => startOfMonth(new Date()));
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Weekday labels based on locale
  const weekdayLabels = useMemo(() => {
    if (locale === 'de') {
      return ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'];
    }
    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  }, [locale]);

  // Fetch blocked dates from API
  useEffect(() => {
    async function fetchBlockedDates() {
      setLoading(true);
      setError(null);

      try {
        // Calculate date range for 6 months ahead
        const startDate = format(currentDate, 'yyyy-MM-dd');
        const endDate = format(addMonths(currentDate, 6), 'yyyy-MM-dd');

        const response = await fetch('/api/availability/blocked-dates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            propertyId,
            startDate,
            endDate,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch availability');
        }

        const data = await response.json();
        setBlockedDates(data.blockedDates || []);
      } catch (err) {
        console.error('[PropertyCalendar] Error fetching blocked dates:', err);
        setError(t('loadError') || 'Failed to load availability');
      } finally {
        setLoading(false);
      }
    }

    fetchBlockedDates();
  }, [propertyId, currentDate, t]);

  // Convert to Set for O(1) lookups
  const blockedDatesSet = useMemo(() => new Set(blockedDates), [blockedDates]);

  // Navigate months
  const goToPreviousMonth = () => {
    const newDate = subMonths(currentDate, 1);
    // Don't go before current month
    if (!isBefore(newDate, startOfMonth(new Date()))) {
      setCurrentDate(newDate);
    }
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  // Calculate the two months to display
  const firstMonth = currentDate;
  const secondMonth = addMonths(currentDate, 1);

  // Check if previous button should be disabled
  const isPrevDisabled = isBefore(
    subMonths(currentDate, 1),
    startOfMonth(new Date())
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl md:text-3xl font-bold text-neutral-900">
        {t('title')}
      </h2>

      {/* Calendar container */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={goToPreviousMonth}
            disabled={isPrevDisabled}
            className={`
              p-2 rounded-lg transition-colors
              ${isPrevDisabled
                ? 'text-neutral-300 cursor-not-allowed'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }
            `}
            aria-label={t('previousMonth') || 'Previous month'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          <button
            onClick={goToNextMonth}
            className="p-2 rounded-lg text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
            aria-label={t('nextMonth') || 'Next month'}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-3 text-neutral-600">
              {t('loading') || 'Loading availability...'}
            </span>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => setCurrentDate(startOfMonth(new Date()))}
              className="mt-2 text-sm text-red-600 underline hover:no-underline"
            >
              {t('retry') || 'Try again'}
            </button>
          </div>
        )}

        {/* Calendar grid */}
        {!loading && !error && (
          <div className="flex flex-col md:flex-row gap-8">
            <MonthCalendar
              month={firstMonth}
              blockedDates={blockedDatesSet}
              locale={locale}
              weekdayLabels={weekdayLabels}
            />
            <MonthCalendar
              month={secondMonth}
              blockedDates={blockedDatesSet}
              locale={locale}
              weekdayLabels={weekdayLabels}
            />
          </div>
        )}

        {/* Legend */}
        {!loading && !error && (
          <div className="mt-6 pt-4 border-t border-neutral-200 flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-neutral-900 font-medium">7</span>
              <span className="text-neutral-600">{t('available') || 'Available'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-300 line-through">7</span>
              <span className="text-neutral-600">{t('booked') || 'Booked'}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-neutral-300">7</span>
              <span className="text-neutral-600">{t('past') || 'Past'}</span>
            </div>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
        <p className="text-neutral-700">
          {t('infoText')}
        </p>
      </div>
    </div>
  );
};

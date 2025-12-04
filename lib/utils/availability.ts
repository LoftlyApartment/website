/**
 * Availability Utility Functions
 * Helper functions for checking property availability using Guestly API
 */

import { format, parse } from 'date-fns';

// ============================================================================
// Types
// ============================================================================

export interface AvailabilityCheckResult {
  available: boolean;
  unavailableDates: string[]; // Array of ISO date strings (YYYY-MM-DD)
  error?: string;
}

export interface AvailabilityResponse {
  available: boolean;
  unavailableDates: string[];
  message?: string;
}

// ============================================================================
// Property Key Mapping
// ============================================================================

// Map booking form property IDs/slugs to Guestly property keys
// Supports both old short IDs and new slugs
export const BOOKING_TO_GUESTLY_MAP: Record<string, string> = {
  // Old short IDs (for backwards compatibility)
  'kant': 'kantstrasse',
  'hinden': 'hindenburgufer',
  'kotti': 'kottbusserdamm',
  // New slugs (matching Supabase)
  'kantstrasse': 'kantstrasse',
  'hindenburgdamm': 'hindenburgufer',  // Note: Supabase slug differs from Guesty key
  'kottbusserdamm': 'kottbusserdamm',
};

/**
 * Convert booking property ID or slug to Guestly property key
 */
export function toGuestlyPropertyKey(bookingPropertyId: string): string {
  return BOOKING_TO_GUESTLY_MAP[bookingPropertyId] || bookingPropertyId;
}

// ============================================================================
// API Client Functions
// ============================================================================

/**
 * Check if a property is available for specific dates
 * Uses real-time Guesty API for accurate availability
 *
 * @param propertyId - Property ID from booking form ('kant', 'hinden')
 * @param checkIn - Check-in date
 * @param checkOut - Check-out date
 * @returns Availability check result
 */
export async function checkAvailability(
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<AvailabilityCheckResult> {
  try {
    // Format dates for API
    const checkInStr = format(checkIn, 'yyyy-MM-dd');
    const checkOutStr = format(checkOut, 'yyyy-MM-dd');

    console.log(`[checkAvailability] Checking real-time availability for ${propertyId} from ${checkInStr} to ${checkOutStr}`);

    // Use real-time endpoint for accurate availability
    const response = await fetch(
      '/api/availability/check',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          checkIn: checkInStr,
          checkOut: checkOutStr,
        }),
      }
    );

    if (!response.ok) {
      console.error('[checkAvailability] Availability check failed:', response.status);

      return {
        available: true, // Graceful fallback - allow booking
        unavailableDates: [],
        error: 'Failed to check availability',
      };
    }

    const data = await response.json();

    console.log(`[checkAvailability] ${data.available ? 'Available' : 'Unavailable'} (${data.unavailableDates?.length || 0} blocked dates)`);

    return {
      available: data.available,
      unavailableDates: data.unavailableDates || [],
    };

  } catch (error) {
    console.error('[checkAvailability] Error checking availability:', error);

    // Graceful fallback - allow booking but log error
    return {
      available: true,
      unavailableDates: [],
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

/**
 * Get unavailable dates for a property in a date range
 * Used for calendar UI to disable unavailable dates
 *
 * @param propertyId - Property ID from booking form
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Array of unavailable date strings (YYYY-MM-DD)
 */
export async function getUnavailableDates(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  try {
    const result = await checkAvailability(propertyId, startDate, endDate);
    return result.unavailableDates;
  } catch (error) {
    console.error('Error getting unavailable dates:', error);
    return []; // Return empty array on error (don't block UI)
  }
}

/**
 * Get all blocked dates for a date range (for calendar display)
 * Fetches real-time availability data from Guesty API
 *
 * @param propertyId - Property ID from booking form
 * @param startDate - Start date (Date)
 * @param endDate - End date (Date)
 * @returns Array of blocked date strings (YYYY-MM-DD)
 */
export async function getBlockedDates(
  propertyId: string,
  startDate: Date,
  endDate: Date
): Promise<string[]> {
  try {
    // Format dates for API
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    console.log(`[getBlockedDates] Fetching real-time availability for ${propertyId} from ${startDateStr} to ${endDateStr}`);

    // Call the API that checks availability with Guesty (real-time)
    const response = await fetch(
      '/api/availability/check',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          checkIn: startDateStr,
          checkOut: endDateStr,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch availability: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`[getBlockedDates] Retrieved ${data.unavailableDates?.length || 0} blocked dates`);

    return data.unavailableDates || [];
  } catch (error) {
    console.error('[getBlockedDates] Error getting blocked dates:', error);
    return []; // Return empty array on error (don't block calendar UI)
  }
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate that dates don't conflict with unavailable dates
 */
export function validateDatesAgainstAvailability(
  checkIn: Date,
  checkOut: Date,
  unavailableDates: string[]
): { valid: boolean; conflictingDates: string[] } {
  const conflictingDates: string[] = [];

  // Check each date in the range
  const current = new Date(checkIn);
  while (current < checkOut) {
    const dateStr = format(current, 'yyyy-MM-dd');
    if (unavailableDates.includes(dateStr)) {
      conflictingDates.push(dateStr);
    }
    current.setDate(current.getDate() + 1);
  }

  return {
    valid: conflictingDates.length === 0,
    conflictingDates,
  };
}

/**
 * Format unavailable dates for display
 */
export function formatUnavailableDates(dates: string[]): string {
  if (dates.length === 0) return '';
  if (dates.length === 1) return format(parse(dates[0], 'yyyy-MM-dd', new Date()), 'MMM d, yyyy');

  // Show first and last dates if multiple
  const first = format(parse(dates[0], 'yyyy-MM-dd', new Date()), 'MMM d');
  const last = format(parse(dates[dates.length - 1], 'yyyy-MM-dd', new Date()), 'MMM d, yyyy');

  return `${first} - ${last}`;
}

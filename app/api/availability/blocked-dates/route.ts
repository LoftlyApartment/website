/**
 * Blocked Dates API Route
 * Returns blocked/booked dates for a property from Guesty API
 * Used by the property calendar to show unavailable dates
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAvailability, PROPERTY_MAP, type PropertyKey } from '@/integrations/guestly/client';

// ============================================================================
// Types
// ============================================================================

interface BlockedDatesRequest {
  propertyId: string; // Booking form property ID ('kant', 'hinden', 'kotti')
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
}

interface BlockedDatesResponse {
  propertyId: string;
  blockedDates: string[];
  startDate: string;
  endDate: string;
}

// ============================================================================
// Property ID Mapping
// ============================================================================

// Map booking form property IDs to Guestly property keys
const BOOKING_TO_GUESTLY: Record<string, PropertyKey> = {
  'kant': 'kantstrasse',
  'hinden': 'hindenburgufer',
  'kotti': 'kottbusserdamm',
};

/**
 * Get Guestly property key from booking property ID
 */
function getGuestlyPropertyKey(bookingPropertyId: string): PropertyKey | null {
  return BOOKING_TO_GUESTLY[bookingPropertyId] || null;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate date format (YYYY-MM-DD)
 */
function isValidDate(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Validate request body
 */
function validateRequest(body: any): { valid: boolean; error?: string } {
  if (!body.propertyId || typeof body.propertyId !== 'string') {
    return { valid: false, error: 'Property ID is required' };
  }

  if (!body.startDate || typeof body.startDate !== 'string') {
    return { valid: false, error: 'Start date is required' };
  }

  if (!body.endDate || typeof body.endDate !== 'string') {
    return { valid: false, error: 'End date is required' };
  }

  if (!isValidDate(body.startDate)) {
    return { valid: false, error: 'Invalid start date format (use YYYY-MM-DD)' };
  }

  if (!isValidDate(body.endDate)) {
    return { valid: false, error: 'Invalid end date format (use YYYY-MM-DD)' };
  }

  const startDate = new Date(body.startDate);
  const endDate = new Date(body.endDate);

  if (endDate <= startDate) {
    return { valid: false, error: 'End date must be after start date' };
  }

  return { valid: true };
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: BlockedDatesRequest = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { propertyId, startDate, endDate } = body;

    // Convert booking property ID to Guestly property key
    const guestlyKey = getGuestlyPropertyKey(propertyId);
    if (!guestlyKey) {
      console.error(`[Blocked Dates API] Unknown property ID: ${propertyId}`);
      return NextResponse.json(
        { error: `Unknown property: ${propertyId}` },
        { status: 400 }
      );
    }

    // Get Guesty property ID
    const guestlyPropertyId = PROPERTY_MAP[guestlyKey];
    if (!guestlyPropertyId) {
      console.error(`[Blocked Dates API] No Guesty mapping for property key: ${guestlyKey}`);
      return NextResponse.json(
        { error: 'Property configuration error' },
        { status: 500 }
      );
    }

    console.log(`[Blocked Dates API] Fetching availability for ${propertyId} (${guestlyKey}) from ${startDate} to ${endDate}`);

    // Fetch availability from Guesty API
    const availabilityData = await getAvailability(guestlyPropertyId, startDate, endDate);

    // Extract blocked/booked dates
    const blockedDates: string[] = [];

    for (const day of availabilityData) {
      // Check if day is booked or blocked
      if (day.status === 'booked' || day.status === 'blocked') {
        blockedDates.push(day.date);
      }
    }

    console.log(`[Blocked Dates API] Found ${blockedDates.length} blocked dates for ${propertyId}`);

    // Build response
    const response: BlockedDatesResponse = {
      propertyId,
      blockedDates,
      startDate,
      endDate,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Blocked Dates API] Error:', error);

    // Return error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to fetch blocked dates',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// OPTIONS handler for CORS
// ============================================================================

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        'Allow': 'POST, OPTIONS',
      },
    }
  );
}

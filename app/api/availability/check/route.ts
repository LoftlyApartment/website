/**
 * Availability Check API Route
 * Server-side endpoint for checking property availability via Guestly API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAvailability, PROPERTY_MAP, type PropertyKey } from '@/integrations/guestly/client';

// ============================================================================
// Types
// ============================================================================

interface CheckAvailabilityRequest {
  propertyId: string; // Booking form property ID ('kant', 'hinden')
  checkIn: string; // ISO date string (YYYY-MM-DD)
  checkOut: string; // ISO date string (YYYY-MM-DD)
}

interface CheckAvailabilityResponse {
  available: boolean;
  unavailableDates: string[];
  message?: string;
}

// ============================================================================
// Property ID Mapping
// ============================================================================

// Map booking form property IDs/slugs to Guestly property keys
// Supports both old short IDs and new slugs
const BOOKING_TO_GUESTLY: Record<string, PropertyKey> = {
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
 * Get Guestly property key from booking property ID or slug
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

  if (!body.checkIn || typeof body.checkIn !== 'string') {
    return { valid: false, error: 'Check-in date is required' };
  }

  if (!body.checkOut || typeof body.checkOut !== 'string') {
    return { valid: false, error: 'Check-out date is required' };
  }

  if (!isValidDate(body.checkIn)) {
    return { valid: false, error: 'Invalid check-in date format (use YYYY-MM-DD)' };
  }

  if (!isValidDate(body.checkOut)) {
    return { valid: false, error: 'Invalid check-out date format (use YYYY-MM-DD)' };
  }

  const checkIn = new Date(body.checkIn);
  const checkOut = new Date(body.checkOut);

  if (checkOut <= checkIn) {
    return { valid: false, error: 'Check-out date must be after check-in date' };
  }

  return { valid: true };
}

// ============================================================================
// API Handler
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CheckAvailabilityRequest = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { propertyId, checkIn, checkOut } = body;

    // Convert booking property ID to Guestly property key
    const guestlyKey = getGuestlyPropertyKey(propertyId);
    if (!guestlyKey) {
      console.error(`Unknown property ID: ${propertyId}`);
      return NextResponse.json(
        { error: `Unknown property: ${propertyId}` },
        { status: 400 }
      );
    }

    // Get Guestly property ID
    const guestlyPropertyId = PROPERTY_MAP[guestlyKey];
    if (!guestlyPropertyId) {
      console.error(`No Guestly mapping for property key: ${guestlyKey}`);
      return NextResponse.json(
        { error: 'Property configuration error' },
        { status: 500 }
      );
    }

    console.log(`[Availability API] Checking availability for ${propertyId} (${guestlyKey}) from ${checkIn} to ${checkOut}`);

    // Fetch availability from Guestly API (with caching)
    const availabilityData = await getAvailability(guestlyPropertyId, checkIn, checkOut);

    // Parse availability data to find unavailable dates
    const unavailableDates: string[] = [];
    let allAvailable = true;

    for (const day of availabilityData) {
      // Check if day is booked or blocked
      if (day.status === 'booked' || day.status === 'blocked') {
        unavailableDates.push(day.date);
        allAvailable = false;
      }
    }

    // Build response
    const response: CheckAvailabilityResponse = {
      available: allAvailable,
      unavailableDates,
    };

    if (!allAvailable) {
      response.message = `Property has ${unavailableDates.length} unavailable date(s) in the selected range`;
    }

    console.log(`[Availability API] Result: ${allAvailable ? 'Available' : 'Unavailable'} (${unavailableDates.length} blocked dates)`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Availability API] Error:', error);

    // Return error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to check availability',
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

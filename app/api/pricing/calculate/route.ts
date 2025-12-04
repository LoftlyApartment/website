/**
 * Pricing Calculation API Route
 * Server-side endpoint for calculating real-time pricing from Guestly
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPricing, PROPERTY_MAP, type PropertyKey } from '@/integrations/guestly/client';
import { PROPERTIES } from '@/lib/utils/booking';

// ============================================================================
// Types
// ============================================================================

interface CalculatePricingRequest {
  propertyKey: string; // 'kantstrasse' or 'hindenburgufer'
  checkIn: string; // ISO date string (YYYY-MM-DD)
  checkOut: string; // ISO date string (YYYY-MM-DD)
  guests: number;
  hasPet?: boolean;
}

interface PricingBreakdown {
  basePrice: number; // Average nightly rate
  nights: number;
  subtotalBeforeDiscount: number;
  discount: number;
  discountPercentage: number;
  subtotalAfterDiscount: number;
  cleaningFee: number;
  petFee: number;
  subtotal: number;
  vat: number;
  vatRate: number;
  total: number;
  currency: string;
  source: 'guestly' | 'fallback';
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

// Map Guestly keys to booking property IDs for fallback
const GUESTLY_TO_BOOKING: Record<PropertyKey, string> = {
  'kantstrasse': 'kant',
  'hindenburgufer': 'hinden',
  'kottbusserdamm': 'kotti',
};

/**
 * Get Guestly property key from booking property ID
 */
function getGuestlyPropertyKey(bookingPropertyId: string): PropertyKey | null {
  return BOOKING_TO_GUESTLY[bookingPropertyId] || bookingPropertyId as PropertyKey;
}

/**
 * Get booking property ID from Guestly key
 */
function getBookingPropertyId(guestlyKey: PropertyKey): string {
  return GUESTLY_TO_BOOKING[guestlyKey] || guestlyKey;
}

// ============================================================================
// Website Fee Configuration
// ============================================================================

const WEBSITE_FEES = {
  'kant': {
    cleaningFee: 50,
    petFee: 0, // Not pet-friendly
  },
  'hinden': {
    cleaningFee: 40,
    petFee: 20,
  },
} as const;

const VAT_RATE = 19; // 19% VAT

// ============================================================================
// Pricing Calculation
// ============================================================================

/**
 * Calculate discount based on length of stay
 * 10% for 7+ nights, 20% for 28+ nights
 */
function calculateDiscount(nights: number, subtotal: number): { amount: number; percentage: number } {
  if (nights >= 28) {
    return { amount: subtotal * 0.2, percentage: 20 };
  } else if (nights >= 7) {
    return { amount: subtotal * 0.1, percentage: 10 };
  }
  return { amount: 0, percentage: 0 };
}

/**
 * Calculate complete pricing breakdown from Guestly data
 */
function calculatePricingBreakdown(
  guestlyPricing: any,
  bookingPropertyId: string,
  hasPet: boolean
): PricingBreakdown {
  const fees = WEBSITE_FEES[bookingPropertyId as keyof typeof WEBSITE_FEES] || { cleaningFee: 0, petFee: 0 };

  const basePrice = guestlyPricing.basePrice;
  const nights = guestlyPricing.totalNights;
  const subtotalBeforeDiscount = guestlyPricing.subtotalBeforeDiscount;

  // Calculate discount
  const { amount: discountAmount, percentage: discountPercentage } = calculateDiscount(nights, subtotalBeforeDiscount);
  const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;

  // Add fees
  const cleaningFee = fees.cleaningFee;
  const petFee = hasPet ? fees.petFee : 0;

  const subtotal = subtotalAfterDiscount + cleaningFee + petFee;
  const vat = subtotal * (VAT_RATE / 100);
  const total = subtotal + vat;

  return {
    basePrice,
    nights,
    subtotalBeforeDiscount,
    discount: discountAmount,
    discountPercentage,
    subtotalAfterDiscount,
    cleaningFee,
    petFee,
    subtotal,
    vat,
    vatRate: VAT_RATE,
    total,
    currency: guestlyPricing.currency || 'EUR',
    source: 'guestly',
  };
}

/**
 * Calculate fallback pricing using local prices
 */
function calculateFallbackPricing(
  bookingPropertyId: string,
  nights: number,
  hasPet: boolean
): PricingBreakdown {
  const property = PROPERTIES[bookingPropertyId];
  if (!property) {
    throw new Error(`Unknown property: ${bookingPropertyId}`);
  }

  const basePrice = property.basePrice;
  const subtotalBeforeDiscount = basePrice * nights;

  const { amount: discountAmount, percentage: discountPercentage } = calculateDiscount(nights, subtotalBeforeDiscount);
  const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;

  const cleaningFee = property.cleaningFee;
  const petFee = hasPet && property.petFriendly ? property.petFee : 0;

  const subtotal = subtotalAfterDiscount + cleaningFee + petFee;
  const vat = subtotal * (VAT_RATE / 100);
  const total = subtotal + vat;

  return {
    basePrice,
    nights,
    subtotalBeforeDiscount,
    discount: discountAmount,
    discountPercentage,
    subtotalAfterDiscount,
    cleaningFee,
    petFee,
    subtotal,
    vat,
    vatRate: VAT_RATE,
    total,
    currency: 'EUR',
    source: 'fallback',
  };
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
  if (!body.propertyKey || typeof body.propertyKey !== 'string') {
    return { valid: false, error: 'Property key is required' };
  }

  if (!body.checkIn || typeof body.checkIn !== 'string') {
    return { valid: false, error: 'Check-in date is required' };
  }

  if (!body.checkOut || typeof body.checkOut !== 'string') {
    return { valid: false, error: 'Check-out date is required' };
  }

  if (!body.guests || typeof body.guests !== 'number' || body.guests < 1) {
    return { valid: false, error: 'Valid number of guests is required' };
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
    const body: CalculatePricingRequest = await request.json();

    // Validate request
    const validation = validateRequest(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { propertyKey, checkIn, checkOut, guests, hasPet = false } = body;

    // Get Guestly property key
    const guestlyKey = getGuestlyPropertyKey(propertyKey);
    if (!guestlyKey) {
      return NextResponse.json(
        { error: `Unknown property: ${propertyKey}` },
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

    // Get booking property ID for fees
    const bookingPropertyId = getBookingPropertyId(guestlyKey);

    console.log(`[Pricing API] Calculating pricing for ${propertyKey} (${guestlyKey}) from ${checkIn} to ${checkOut}`);

    let pricingBreakdown: PricingBreakdown;

    try {
      // Fetch pricing from Guestly API (with caching)
      const guestlyPricing = await getPricing(guestlyPropertyId, checkIn, checkOut, guests);

      // Calculate complete breakdown with website fees
      pricingBreakdown = calculatePricingBreakdown(guestlyPricing, bookingPropertyId, hasPet);

      console.log(`[Pricing API] Guestly pricing: ${guestlyPricing.totalNights} nights @ ${guestlyPricing.basePrice} avg/night = ${guestlyPricing.subtotalBeforeDiscount} total`);
    } catch (error) {
      // Guestly API failed - fall back to local pricing
      console.warn('[Pricing API] Guestly pricing failed, using fallback pricing:', error);

      // Calculate nights from dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

      pricingBreakdown = calculateFallbackPricing(bookingPropertyId, nights, hasPet);
    }

    console.log(`[Pricing API] Total: ${pricingBreakdown.total} ${pricingBreakdown.currency} (source: ${pricingBreakdown.source})`);

    return NextResponse.json(pricingBreakdown);

  } catch (error) {
    console.error('[Pricing API] Error:', error);

    // Return error response
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        error: 'Failed to calculate pricing',
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

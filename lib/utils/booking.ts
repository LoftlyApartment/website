import { differenceInDays, addDays } from 'date-fns';

export interface Property {
  id: string;
  slug: string;
  name: string;
  basePrice: number;
  cleaningFee: number;
  maxGuests: number;
  petFriendly: boolean;
  petFee: number;
}

export const PROPERTIES: Record<string, Property> = {
  'kantstrasse': {
    id: 'kant',
    slug: 'kantstrasse',
    name: 'Kantstrasse Apartment',
    basePrice: 120,
    cleaningFee: 50,
    maxGuests: 5,
    petFriendly: false,
    petFee: 0,
  },
  'hindenburgdamm': {
    id: 'hinden',
    slug: 'hindenburgdamm',
    name: 'Hindenburgdamm Apartment',
    basePrice: 95,
    cleaningFee: 40,
    maxGuests: 4,
    petFriendly: true,
    petFee: 20,
  },
  'kottbusserdamm': {
    id: 'kotti',
    slug: 'kottbusserdamm',
    name: 'Kottbusser Damm Apartment',
    basePrice: 140,
    cleaningFee: 60,
    maxGuests: 7,
    petFriendly: true,
    petFee: 25,
  },
};

export interface PricingBreakdown {
  basePrice: number;
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
}

/**
 * Calculate number of nights between two dates
 * Uses date-fns differenceInDays to accurately calculate nights without timezone issues
 */
export function calculateNights(checkIn: Date, checkOut: Date): number {
  // differenceInDays handles timezone issues correctly
  return differenceInDays(checkOut, checkIn);
}

/**
 * Calculate base price for a property
 */
export function calculateBasePrice(propertyId: string, nights: number): number {
  const property = PROPERTIES[propertyId];
  if (!property) return 0;
  return property.basePrice * nights;
}

/**
 * Calculate discount based on length of stay
 * 10% for 7+ nights, 20% for 28+ nights
 */
export function calculateDiscount(nights: number, subtotal: number): { amount: number; percentage: number } {
  if (nights >= 28) {
    return { amount: subtotal * 0.2, percentage: 20 };
  } else if (nights >= 7) {
    return { amount: subtotal * 0.1, percentage: 10 };
  }
  return { amount: 0, percentage: 0 };
}

/**
 * Calculate complete pricing breakdown (FALLBACK ONLY)
 * Use fetchGuestlyPricing() for real-time pricing from Guestly
 * This function is kept for backward compatibility and fallback scenarios
 */
export function calculateTotalPrice(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  hasPet: boolean = false
): PricingBreakdown {
  const property = PROPERTIES[propertyId];
  if (!property) {
    return {
      basePrice: 0,
      nights: 0,
      subtotalBeforeDiscount: 0,
      discount: 0,
      discountPercentage: 0,
      subtotalAfterDiscount: 0,
      cleaningFee: 0,
      petFee: 0,
      subtotal: 0,
      vat: 0,
      vatRate: 19,
      total: 0,
    };
  }

  const nights = calculateNights(checkIn, checkOut);
  const basePrice = property.basePrice;
  const subtotalBeforeDiscount = basePrice * nights;

  const { amount: discountAmount, percentage: discountPercentage } = calculateDiscount(nights, subtotalBeforeDiscount);
  const subtotalAfterDiscount = subtotalBeforeDiscount - discountAmount;

  const cleaningFee = property.cleaningFee;
  const petFee = hasPet && property.petFriendly ? property.petFee : 0;

  const subtotal = subtotalAfterDiscount + cleaningFee + petFee;
  const vatRate = 19;
  const vat = subtotal * (vatRate / 100);
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
    vatRate,
    total,
  };
}

/**
 * Fetch real-time pricing from Guestly via API route
 * This is the PREFERRED method for getting pricing
 * Falls back to local pricing if API call fails
 */
export async function fetchGuestlyPricing(
  propertyId: string,
  checkIn: Date,
  checkOut: Date,
  guests: number,
  hasPet: boolean = false
): Promise<PricingBreakdown> {
  try {
    const checkInStr = checkIn.toISOString().split('T')[0];
    const checkOutStr = checkOut.toISOString().split('T')[0];

    const response = await fetch('/api/pricing/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        propertyKey: propertyId,
        checkIn: checkInStr,
        checkOut: checkOutStr,
        guests,
        hasPet,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('[Pricing Fetch] API error:', error);
      throw new Error(error.error || 'Failed to fetch pricing');
    }

    const pricing = await response.json();
    console.log('[Pricing Fetch] Success:', pricing);
    return pricing;

  } catch (error) {
    console.error('[Pricing Fetch] Error, using fallback:', error);
    // Fallback to local pricing calculation
    return calculateTotalPrice(propertyId, checkIn, checkOut, hasPet);
  }
}

/**
 * Generate a unique booking reference
 */
export function generateBookingReference(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(10000 + Math.random() * 90000);
  return `LA${year}-${random}`;
}

/**
 * Check if a date is available (mock implementation)
 * TODO: Replace with actual Lodgify integration
 */
export function isDateAvailable(date: Date, _propertyId: string): boolean {
  // Mock: Block some random dates for demonstration
  // TODO: Use _propertyId to check actual availability from Lodgify
  const dayOfMonth = date.getDate();
  // Block dates 15-20 of each month as example
  return dayOfMonth < 15 || dayOfMonth > 20;
}

/**
 * Get minimum checkout date (3 nights minimum stay)
 */
export function getMinCheckoutDate(checkIn: Date): Date {
  return addDays(checkIn, 3);
}

/**
 * Get minimum check-in date (tomorrow)
 */
export function getMinCheckInDate(): Date {
  return addDays(new Date(), 1);
}

/**
 * Validate date range
 */
export function isValidDateRange(checkIn: Date | null, checkOut: Date | null): boolean {
  if (!checkIn || !checkOut) return false;

  const nights = calculateNights(checkIn, checkOut);
  const minCheckIn = getMinCheckInDate();
  const isValid = checkIn >= minCheckIn && nights >= 3;

  // Debug logging
  console.log('Date validation:', {
    checkIn: checkIn.toISOString(),
    checkOut: checkOut.toISOString(),
    nights,
    minCheckIn: minCheckIn.toISOString(),
    isValid,
  });

  return isValid;
}

/**
 * Format price for display
 */
export function formatPrice(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-US', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

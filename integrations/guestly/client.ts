/**
 * Guestly API Client
 * Official integration with Guestly's Open API for property management
 * Documentation: https://open-api.guesty.com/v1
 */

// Supabase cache for OAuth tokens and availability data
import {
  getCachedOAuthToken,
  setCachedOAuthToken,
  getCachedAvailability,
  setCachedAvailability
} from '@/lib/cache/supabase-cache';

// Availability cache is now background-managed, no per-request caching needed
import {
  getCacheStatistics as getAvailabilityCacheStats,
  clearAvailabilityCache
} from '@/lib/cache/availability-cache';

import {
  getCachedPricing as getCachedPricingSupabase,
  setCachedPricing as setCachedPricingSupabase,
} from '@/lib/cache/supabase-cache';

import {
  clearPricingCache,
  type PricingData
} from '@/lib/cache/pricing-cache';

import {
  getCachedToken,
  setCachedToken,
  clearCachedToken,
  setRefreshPromise,
  getRefreshPromise,
  clearRefreshPromise,
  getCacheStatistics as getOAuthCacheStats,
  type OAuthToken
} from '@/lib/cache/oauth-token-cache';

// ============================================================================
// TypeScript Types & Interfaces
// ============================================================================

export interface GuestlyProperty {
  _id: string;
  nickname?: string;
  title: string;
  address?: {
    full?: string;
    street?: string;
    city?: string;
    country?: string;
    zipcode?: string;
    lat?: number;
    lng?: number;
  };
  accommodates?: number;
  bedrooms?: number;
  bathrooms?: number;
  beds?: number;
  propertyType?: string;
  roomType?: string;
  amenities?: string[];
  pictures?: Array<{
    _id: string;
    thumbnail?: string;
    regular?: string;
    large?: string;
    caption?: string;
  }>;
  prices?: {
    basePrice?: number;
    currency?: string;
    weeklyPriceFactor?: number;
    monthlyPriceFactor?: number;
  };
  publicDescription?: {
    summary?: string;
    space?: string;
    access?: string;
    notes?: string;
  };
  terms?: {
    minNights?: number;
    maxNights?: number;
  };
  active?: boolean;
  listed?: boolean;
}

export interface GuestlyReservation {
  _id: string;
  listingId: string;
  checkIn: string; // ISO date string
  checkOut: string; // ISO date string
  status: 'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'declined';
  guestName?: string;
  guestEmail?: string;
  guestPhone?: string;
  numberOfGuests?: number;
  money?: {
    fareAccommodation?: number;
    hostPayout?: number;
    totalPaid?: number;
    currency?: string;
  };
  notes?: string;
  source?: string;
  confirmationCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface GuestlyAvailability {
  date: string; // ISO date string
  status: 'available' | 'booked' | 'blocked';
  price?: number;
  minNights?: number;
}

export interface ReservationData {
  listingId: string;
  checkIn: string; // ISO date string (YYYY-MM-DD)
  checkOut: string; // ISO date string (YYYY-MM-DD)
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  status?: 'inquiry' | 'reserved' | 'confirmed' | 'canceled' | 'declined';
  money?: {
    fareAccommodation: number;
    currency?: string;
  };
  notes?: string;
  source?: string;
}

export interface GuestlyApiError {
  message: string;
  statusCode: number;
  details?: any;
}

// ============================================================================
// Property ID Mappings (Hardcoded)
// ============================================================================

export const PROPERTY_MAP = {
  'kantstrasse': '68e0da429e441d00129131d7',
  'hindenburgufer': '68e0da486cf6cf001162ee98',
  'kottbusserdamm': '68e0da5866b8a40012e6ec15'
} as const;

export type PropertyKey = keyof typeof PROPERTY_MAP;

// ============================================================================
// API Configuration
// ============================================================================

const BASE_URL = 'https://open-api.guesty.com/v1';
const OAUTH_TOKEN_URL = 'https://open-api.guesty.com/oauth2/token';

/**
 * Get Guesty OAuth credentials from environment
 */
function getOAuthCredentials(): { clientId: string; clientSecret: string } {
  const clientId = process.env.GUESTY_CLIENT_ID;
  const clientSecret = process.env.GUESTY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      'GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET must be configured in environment variables. ' +
      'OAuth 2.0 authentication is required for Guesty API access.'
    );
  }

  return { clientId, clientSecret };
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Track rate limit state globally to prevent hammering the API
let rateLimitedUntil = 0;

/**
 * Exchange OAuth credentials for access token with retry logic
 * Implements exponential backoff for rate limiting (429) errors
 * First checks Supabase cache for valid token (shared across serverless instances)
 * @returns OAuth token with access_token and expiry
 */
async function fetchAccessToken(retryCount = 0): Promise<OAuthToken> {
  const MAX_RETRIES = 3;
  const BASE_DELAY_MS = 5000; // 5 seconds base delay (increased from 2s)

  // Check Supabase cache first for a valid token (shared across serverless instances)
  try {
    const cachedToken = await getCachedOAuthToken('guesty');
    if (cachedToken) {
      console.log('[OAuth] Using cached OAuth token from Supabase (shared cache)');
      // Convert Supabase format to OAuthToken format
      const expiresAt = new Date(cachedToken.expires_at);
      const expiresAtTimestamp = expiresAt.getTime();
      const expiresIn = Math.floor((expiresAtTimestamp - Date.now()) / 1000);
      return {
        access_token: cachedToken.access_token,
        token_type: cachedToken.token_type,
        expires_in: expiresIn,
        expires_at: expiresAtTimestamp
      };
    }
  } catch (error) {
    console.warn('[OAuth] Error checking Supabase cache, falling back to API:', error);
    // Continue to fetch from API if cache check fails
  }

  // Check if we're in a rate-limit cooldown period
  const now = Date.now();
  if (rateLimitedUntil > now) {
    const waitTime = rateLimitedUntil - now;
    console.log(`[OAuth] In rate-limit cooldown, waiting ${Math.round(waitTime/1000)}s...`);
    await sleep(waitTime);
  }

  const { clientId, clientSecret } = getOAuthCredentials();

  console.log(`[OAuth] Requesting new access token from Guesty... (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);

  // Build form-urlencoded body
  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    scope: 'open-api',
    client_id: clientId,
    client_secret: clientSecret
  });

  try {
    const response = await fetch(OAUTH_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: body.toString()
    });

    if (!response.ok) {
      let errorDetails: any;
      try {
        errorDetails = await response.json();
      } catch {
        errorDetails = await response.text();
      }

      console.error('[OAuth] Token request failed:', {
        status: response.status,
        statusText: response.statusText,
        details: errorDetails
      });

      // Handle rate limiting with retry
      if (response.status === 429) {
        // Check for Retry-After header
        const retryAfter = response.headers.get('Retry-After');
        let delay: number;

        if (retryAfter) {
          // Retry-After can be seconds or HTTP-date
          delay = parseInt(retryAfter, 10) * 1000 || 60000;
        } else {
          // Use exponential backoff: 5s, 10s, 20s, 40s
          delay = BASE_DELAY_MS * Math.pow(2, retryCount);
        }

        // Set global rate limit cooldown (minimum 60 seconds)
        const cooldownTime = Math.max(delay, 60000);
        rateLimitedUntil = Date.now() + cooldownTime;

        if (retryCount < MAX_RETRIES) {
          console.log(`[OAuth] Rate limited (429), setting ${Math.round(cooldownTime/1000)}s cooldown, retrying in ${delay}ms...`);
          await sleep(delay);
          return fetchAccessToken(retryCount + 1);
        }
      }

      throw new Error(
        `OAuth token request failed: ${response.status} ${response.statusText}. ` +
        `Details: ${JSON.stringify(errorDetails)}`
      );
    }

    const tokenData: OAuthToken = await response.json();

    // Validate token response
    if (!tokenData.access_token) {
      throw new Error('OAuth token response missing access_token field');
    }

    console.log(`[OAuth] Access token received, expires in ${tokenData.expires_in} seconds`);

    // Store in Supabase cache (shared across serverless instances, lasts 23 hours)
    try {
      await setCachedOAuthToken(tokenData.access_token, tokenData.expires_in, 'guesty');
    } catch (error) {
      console.warn('[OAuth] Error storing token in Supabase cache:', error);
      // Continue even if caching fails
    }

    return tokenData;

  } catch (error) {
    console.error('[OAuth] Error fetching access token:', error);
    throw error;
  }
}

/**
 * Get valid access token (cached or fresh)
 * Handles concurrent requests with promise deduplication
 * @returns Valid access token string
 */
async function getAccessToken(): Promise<string> {
  // Check if we have a valid cached token
  const cachedToken = getCachedToken();
  if (cachedToken) {
    return cachedToken.access_token;
  }

  // Check if another request is already fetching a token
  const existingRefresh = getRefreshPromise();
  if (existingRefresh) {
    console.log('[OAuth] Waiting for existing token refresh...');
    const token = await existingRefresh;
    return token.access_token;
  }

  // No valid token and no pending refresh - fetch a new one
  const refreshPromise = fetchAccessToken();
  setRefreshPromise(refreshPromise);

  try {
    const token = await refreshPromise;
    setCachedToken(token);
    return token.access_token;
  } finally {
    clearRefreshPromise();
  }
}

/**
 * Get default headers for Guesty API requests
 * Automatically includes valid OAuth token
 */
async function getHeaders(): Promise<HeadersInit> {
  const accessToken = await getAccessToken();

  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle API errors with detailed logging
 * Automatically clears OAuth token on 401 errors
 */
async function handleApiError(response: Response, endpoint: string): Promise<never> {
  let errorDetails: any;

  try {
    // Clone the response so we can read it without consuming it
    const responseClone = response.clone();
    errorDetails = await responseClone.json();
  } catch {
    try {
      // If JSON parsing failed, try text
      const responseClone = response.clone();
      errorDetails = await responseClone.text();
    } catch {
      errorDetails = 'Unable to read response body';
    }
  }

  // If 401 Unauthorized, clear the cached token so next request will fetch a new one
  if (response.status === 401) {
    console.warn('[OAuth] Received 401 Unauthorized, clearing cached token');
    clearCachedToken();
  }

  const error: GuestlyApiError = {
    message: `Guestly API Error at ${endpoint}: ${response.status} ${response.statusText}`,
    statusCode: response.status,
    details: errorDetails
  };

  console.error('Guestly API Error:', {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    details: errorDetails
  });

  throw error;
}

// ============================================================================
// API Methods
// ============================================================================

/**
 * Fetch all properties from Guestly
 * @returns Array of Guestly properties
 */
export async function getProperties(): Promise<GuestlyProperty[]> {
  const endpoint = '/listings';
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders()
    });

    if (!response.ok) {
      await handleApiError(response, endpoint);
    }

    const data = await response.json();

    // Guestly typically returns data in a 'results' array
    const properties = data.results || data;

    console.log(`Successfully fetched ${properties.length} properties from Guestly`);
    return properties;

  } catch (error) {
    console.error('Error fetching properties:', error);
    throw error;
  }
}

/**
 * Get single property details by ID
 * @param propertyId - Guestly property ID
 * @returns Property details
 */
export async function getProperty(propertyId: string): Promise<GuestlyProperty> {
  const endpoint = `/listings/${propertyId}`;
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders()
    });

    if (!response.ok) {
      await handleApiError(response, endpoint);
    }

    const property = await response.json();

    console.log(`Successfully fetched property: ${propertyId}`);
    return property;

  } catch (error) {
    console.error(`Error fetching property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Get property by friendly key (kantstrasse, hindenburgufer)
 * @param key - Property key from PROPERTY_MAP
 * @returns Property details
 */
export async function getPropertyByKey(key: PropertyKey): Promise<GuestlyProperty> {
  const propertyId = PROPERTY_MAP[key];

  if (!propertyId) {
    throw new Error(`Unknown property key: ${key}`);
  }

  return getProperty(propertyId);
}

/**
 * Check availability for a property in a date range
 * First checks Supabase cache (10 minute cache, shared across serverless instances)
 * Falls back to Guesty API if cache miss or expired
 * @param propertyId - Guestly property ID
 * @param startDate - Start date in YYYY-MM-DD format (sent as 'from' parameter to Guesty API)
 * @param endDate - End date in YYYY-MM-DD format (sent as 'to' parameter to Guestly API)
 * @returns Array of availability data for each date
 */
export async function getAvailability(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<GuestlyAvailability[]> {
  // Check Supabase cache first (10 minute cache, shared across serverless instances)
  try {
    const cachedData = await getCachedAvailability(propertyId, startDate, endDate);
    if (cachedData) {
      console.log(`[Availability] Using cached data from Supabase for ${propertyId}`);
      // Convert blocked dates back to GuestlyAvailability format
      const availability: GuestlyAvailability[] = [];
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        const isBlocked = cachedData.blocked_dates.includes(dateStr);
        availability.push({
          date: dateStr,
          status: isBlocked ? 'blocked' : 'available'
        });
      }

      return availability;
    }
  } catch (error) {
    console.warn('[Availability] Error checking Supabase cache, falling back to API:', error);
    // Continue to fetch from API if cache check fails
  }

  // Cache miss - fetch from Guesty API
  const endpoint = `/listings/${propertyId}/calendar`;
  const url = `${BASE_URL}${endpoint}?from=${startDate}&to=${endDate}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders()
    });

    if (!response.ok) {
      await handleApiError(response, endpoint);
    }

    const data = await response.json();

    // Guestly calendar API returns daily availability data
    const availability = data.days || data;

    console.log(`Successfully fetched availability for ${propertyId} from ${startDate} to ${endDate}`);

    // Store in Supabase cache (10 minute cache, shared across serverless instances)
    try {
      const blockedDates = availability
        .filter((day: GuestlyAvailability) => day.status === 'blocked' || day.status === 'booked')
        .map((day: GuestlyAvailability) => day.date);

      await setCachedAvailability(propertyId, startDate, endDate, blockedDates);
    } catch (error) {
      console.warn('[Availability] Error storing in Supabase cache:', error);
      // Continue even if caching fails
    }

    return availability;

  } catch (error) {
    console.error(`Error fetching availability for property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Check if a property is available for specific dates
 * @param propertyId - Guestly property ID
 * @param startDate - Check-in date (YYYY-MM-DD)
 * @param endDate - Check-out date (YYYY-MM-DD)
 * @returns Boolean indicating if property is available
 */
export async function isPropertyAvailable(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<boolean> {
  try {
    const availability = await getAvailability(propertyId, startDate, endDate);

    // Check if all dates in the range are available
    const allAvailable = availability.every(day => day.status === 'available');

    return allAvailable;

  } catch (error) {
    console.error(`Error checking availability for property ${propertyId}:`, error);
    throw error;
  }
}

/**
 * Create a new reservation in Guestly
 * Automatically clears availability cache for the property
 * @param data - Reservation data
 * @returns Created reservation
 */
export async function createReservation(data: ReservationData): Promise<GuestlyReservation> {
  const endpoint = '/reservations';
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      await handleApiError(response, endpoint);
    }

    const reservation = await response.json();

    // Note: Availability cache will auto-refresh within 3.5 minutes
    // No need to manually clear cache

    console.log(`Successfully created reservation: ${reservation._id}`);
    return reservation;

  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}

/**
 * Update an existing reservation
 * Clears availability cache if listingId is provided
 * @param reservationId - Guestly reservation ID
 * @param data - Partial reservation data to update
 * @returns Updated reservation
 */
export async function updateReservation(
  reservationId: string,
  data: Partial<ReservationData>
): Promise<GuestlyReservation> {
  const endpoint = `/reservations/${reservationId}`;
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: await getHeaders(),
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      await handleApiError(response, endpoint);
    }

    const reservation = await response.json();

    // Note: Availability cache will auto-refresh within 3.5 minutes
    // No need to manually clear cache

    console.log(`Successfully updated reservation: ${reservationId}`);
    return reservation;

  } catch (error) {
    console.error(`Error updating reservation ${reservationId}:`, error);
    throw error;
  }
}

/**
 * Fetch reservations with optional filters
 * @param propertyId - Optional property ID filter
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @returns Array of reservations
 */
export async function getReservations(
  propertyId?: string,
  startDate?: string,
  endDate?: string
): Promise<GuestlyReservation[]> {
  const endpoint = '/reservations';

  // Build query parameters
  const params = new URLSearchParams();
  if (propertyId) params.append('listingId', propertyId);
  if (startDate) params.append('checkInDateFrom', startDate);
  if (endDate) params.append('checkOutDateTo', endDate);

  const url = `${BASE_URL}${endpoint}${params.toString() ? `?${params.toString()}` : ''}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders()
    });

    if (!response.ok) {
      await handleApiError(response, endpoint);
    }

    const data = await response.json();

    // Guestly typically returns data in a 'results' array
    const reservations = data.results || data;

    console.log(`Successfully fetched ${reservations.length} reservations`);
    return reservations;

  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
}

/**
 * Get a single reservation by ID
 * @param reservationId - Guestly reservation ID
 * @returns Reservation details
 */
export async function getReservation(reservationId: string): Promise<GuestlyReservation> {
  const endpoint = `/reservations/${reservationId}`;
  const url = `${BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: await getHeaders()
    });

    if (!response.ok) {
      await handleApiError(response, endpoint);
    }

    const reservation = await response.json();

    console.log(`Successfully fetched reservation: ${reservationId}`);
    return reservation;

  } catch (error) {
    console.error(`Error fetching reservation ${reservationId}:`, error);
    throw error;
  }
}

/**
 * Cancel a reservation
 * @param reservationId - Guestly reservation ID
 * @returns Updated reservation with canceled status
 */
export async function cancelReservation(reservationId: string): Promise<GuestlyReservation> {
  return updateReservation(reservationId, { status: 'canceled' });
}

/**
 * Get pricing for a property based on dates and guests
 * Fetches from Guestly availability API which includes nightly pricing
 * Uses Supabase cache with 5-minute TTL to reduce API calls
 * @param propertyId - Guestly property ID
 * @param checkIn - Check-in date (YYYY-MM-DD)
 * @param checkOut - Check-out date (YYYY-MM-DD)
 * @param guests - Number of guests
 * @returns Pricing data including base price and total
 */
export async function getPricing(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<PricingData> {
  // Check Supabase cache first (5 minute cache, shared across serverless instances)
  try {
    const cachedData = await getCachedPricingSupabase(propertyId, checkIn, checkOut, guests);
    if (cachedData) {
      console.log(`[Pricing] Using cached data from Supabase for ${propertyId}`);
      // Convert Supabase format to PricingData format
      return {
        basePrice: cachedData.pricing_data.basePrice,
        totalNights: cachedData.pricing_data.nights,
        subtotalBeforeDiscount: cachedData.pricing_data.total,
        cleaningFee: cachedData.pricing_data.cleaningFee || 0,
        currency: cachedData.pricing_data.currency
      };
    }
  } catch (error) {
    console.warn('[Pricing] Error checking Supabase cache, falling back to API:', error);
    // Continue to fetch from API if cache check fails
  }

  // Cache miss - fetch from availability API (which includes pricing)
  try {
    const availability = await getAvailability(propertyId, checkIn, checkOut);

    // Calculate pricing from availability data
    let totalPrice = 0;
    let nightCount = 0;
    let currency = 'USD'; // Default currency

    for (const day of availability) {
      // Only count nights that are NOT the checkout date
      // (Checkout date is included in the range but not a "night stayed")
      if (day.date !== checkOut) {
        if (day.price && day.price > 0) {
          totalPrice += day.price;
          nightCount++;
        } else {
          // If price is missing or zero, this is a problem
          console.warn(`Missing price for date ${day.date} on property ${propertyId}`);
        }
      }
    }

    // Calculate average nightly rate
    const basePrice = nightCount > 0 ? Math.round(totalPrice / nightCount) : 0;

    const pricingData: PricingData = {
      basePrice,
      totalNights: nightCount,
      subtotalBeforeDiscount: totalPrice,
      cleaningFee: 0, // This will be added by the API route
      currency
    };

    // Store in Supabase cache (5 minute cache, shared across serverless instances)
    try {
      await setCachedPricingSupabase(propertyId, checkIn, checkOut, guests, {
        basePrice: pricingData.basePrice,
        cleaningFee: pricingData.cleaningFee,
        total: pricingData.subtotalBeforeDiscount,
        nights: pricingData.totalNights,
        currency: pricingData.currency
      });
    } catch (error) {
      console.warn('[Pricing] Error storing in Supabase cache:', error);
      // Continue even if caching fails
    }

    console.log(`Successfully calculated pricing for ${propertyId} from ${checkIn} to ${checkOut}: ${nightCount} nights @ ${basePrice} avg/night = ${totalPrice} total`);
    return pricingData;

  } catch (error) {
    console.error(`Error fetching pricing for property ${propertyId}:`, error);
    // Don't cache errors - throw immediately
    throw error;
  }
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get property ID from friendly key
 * @param key - Property key (kantstrasse, hindenburgufer)
 * @returns Guestly property ID
 */
export function getPropertyId(key: PropertyKey): string {
  return PROPERTY_MAP[key];
}

/**
 * Validate date format (YYYY-MM-DD)
 * @param dateString - Date string to validate
 * @returns Boolean indicating if date is valid
 */
export function isValidDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateString)) return false;

  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Format date to YYYY-MM-DD
 * @param date - Date object
 * @returns Formatted date string
 */
export function formatDateForApi(date: Date): string {
  return date.toISOString().split('T')[0];
}

// ============================================================================
// Export cache utilities for direct access
// ============================================================================

// Re-export with more descriptive names
export const getAvailabilityCacheStatistics = getAvailabilityCacheStats;
export const getOAuthCacheStatistics = getOAuthCacheStats;
export { clearAvailabilityCache, clearCachedToken };

// Export with a more user-friendly name
export const clearOAuthToken = clearCachedToken;

/**
 * Get OAuth token info for debugging/monitoring
 */
export async function getOAuthTokenInfo(): Promise<{
  isAuthenticated: boolean;
  tokenInfo: any;
}> {
  try {
    const accessToken = await getAccessToken();
    const stats = getOAuthCacheStats();

    return {
      isAuthenticated: true,
      tokenInfo: {
        hasToken: !!accessToken,
        tokenPreview: accessToken ? `${accessToken.slice(0, 20)}...` : null,
        cacheStats: stats
      }
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      tokenInfo: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

// ============================================================================
// Export default client object
// ============================================================================

export const guestyClient = {
  // Property methods
  getProperties,
  getProperty,
  getPropertyByKey,

  // Availability methods
  getAvailability,
  isPropertyAvailable,

  // Pricing methods
  getPricing,

  // Reservation methods
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  cancelReservation,

  // Utilities
  getPropertyId,
  formatDateForApi,
  isValidDateFormat,

  // Cache utilities
  clearPricingCache,
  getAvailabilityCacheStatistics,

  // OAuth utilities
  getOAuthTokenInfo,
  getOAuthCacheStatistics,
  clearOAuthToken: clearCachedToken,

  // Constants
  PROPERTY_MAP,
  BASE_URL
};

export default guestyClient;

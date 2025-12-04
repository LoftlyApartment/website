/**
 * Supabase-based Cache for Guesty API
 * Prevents rate limiting by caching OAuth tokens, availability, and pricing data
 */

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role for server-side caching
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Cache durations
const OAUTH_TOKEN_CACHE_DURATION_MS = 23 * 60 * 60 * 1000; // 23 hours (tokens last 24h)
const AVAILABILITY_CACHE_DURATION_MS = 10 * 60 * 1000; // 10 minutes
const PRICING_CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes

// ============================================================================
// OAuth Token Cache
// ============================================================================

export interface CachedOAuthToken {
  access_token: string;
  token_type: string;
  expires_at: string;
}

/**
 * Get cached OAuth token from Supabase
 */
export async function getCachedOAuthToken(provider: string = 'guesty'): Promise<CachedOAuthToken | null> {
  try {
    const { data, error } = await supabase
      .from('oauth_token_cache')
      .select('access_token, token_type, expires_at')
      .eq('provider', provider)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      console.log(`[Cache] No valid OAuth token in cache for ${provider}`);
      return null;
    }

    console.log(`[Cache] Found valid OAuth token in cache for ${provider}`);
    return data;
  } catch (error) {
    console.error('[Cache] Error getting OAuth token:', error);
    return null;
  }
}

/**
 * Store OAuth token in Supabase cache
 */
export async function setCachedOAuthToken(
  accessToken: string,
  expiresInSeconds: number,
  provider: string = 'guesty'
): Promise<void> {
  try {
    // Calculate expiration (use slightly less than actual to be safe)
    const expiresAt = new Date(Date.now() + Math.min(expiresInSeconds * 1000, OAUTH_TOKEN_CACHE_DURATION_MS));

    const { error } = await supabase
      .from('oauth_token_cache')
      .upsert({
        provider,
        access_token: accessToken,
        token_type: 'Bearer',
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'provider'
      });

    if (error) {
      console.error('[Cache] Error storing OAuth token:', error);
    } else {
      console.log(`[Cache] Stored OAuth token for ${provider}, expires at ${expiresAt.toISOString()}`);
    }
  } catch (error) {
    console.error('[Cache] Error storing OAuth token:', error);
  }
}

// ============================================================================
// Availability Cache
// ============================================================================

export interface CachedAvailability {
  blocked_dates: string[];
  fetched_at: string;
}

/**
 * Get cached availability data from Supabase
 */
export async function getCachedAvailability(
  propertyId: string,
  startDate: string,
  endDate: string
): Promise<CachedAvailability | null> {
  try {
    const { data, error } = await supabase
      .from('availability_cache')
      .select('blocked_dates, fetched_at')
      .eq('property_id', propertyId)
      .eq('start_date', startDate)
      .eq('end_date', endDate)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      console.log(`[Cache] No valid availability cache for ${propertyId} (${startDate} to ${endDate})`);
      return null;
    }

    console.log(`[Cache] Found availability cache for ${propertyId} with ${data.blocked_dates?.length || 0} blocked dates`);
    return {
      blocked_dates: data.blocked_dates || [],
      fetched_at: data.fetched_at,
    };
  } catch (error) {
    console.error('[Cache] Error getting availability:', error);
    return null;
  }
}

/**
 * Store availability data in Supabase cache
 */
export async function setCachedAvailability(
  propertyId: string,
  startDate: string,
  endDate: string,
  blockedDates: string[]
): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + AVAILABILITY_CACHE_DURATION_MS);

    const { error } = await supabase
      .from('availability_cache')
      .upsert({
        property_id: propertyId,
        start_date: startDate,
        end_date: endDate,
        blocked_dates: blockedDates,
        fetched_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'property_id,start_date,end_date'
      });

    if (error) {
      console.error('[Cache] Error storing availability:', error);
    } else {
      console.log(`[Cache] Stored availability for ${propertyId} (${blockedDates.length} blocked dates), expires in 10 minutes`);
    }
  } catch (error) {
    console.error('[Cache] Error storing availability:', error);
  }
}

// ============================================================================
// Pricing Cache
// ============================================================================

export interface CachedPricing {
  pricing_data: {
    basePrice: number;
    cleaningFee: number;
    total: number;
    nights: number;
    currency: string;
  };
  fetched_at: string;
}

/**
 * Get cached pricing data from Supabase
 */
export async function getCachedPricing(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  guests: number
): Promise<CachedPricing | null> {
  try {
    const { data, error } = await supabase
      .from('pricing_cache')
      .select('pricing_data, fetched_at')
      .eq('property_id', propertyId)
      .eq('check_in', checkIn)
      .eq('check_out', checkOut)
      .eq('guests', guests)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      console.log(`[Cache] No valid pricing cache for ${propertyId} (${checkIn} to ${checkOut})`);
      return null;
    }

    console.log(`[Cache] Found pricing cache for ${propertyId}: €${data.pricing_data?.total}`);
    return {
      pricing_data: data.pricing_data,
      fetched_at: data.fetched_at,
    };
  } catch (error) {
    console.error('[Cache] Error getting pricing:', error);
    return null;
  }
}

/**
 * Store pricing data in Supabase cache
 */
export async function setCachedPricing(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  pricingData: CachedPricing['pricing_data']
): Promise<void> {
  try {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + PRICING_CACHE_DURATION_MS);

    const { error } = await supabase
      .from('pricing_cache')
      .upsert({
        property_id: propertyId,
        check_in: checkIn,
        check_out: checkOut,
        guests,
        pricing_data: pricingData,
        fetched_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
      }, {
        onConflict: 'property_id,check_in,check_out,guests'
      });

    if (error) {
      console.error('[Cache] Error storing pricing:', error);
    } else {
      console.log(`[Cache] Stored pricing for ${propertyId}, expires in 5 minutes`);
    }
  } catch (error) {
    console.error('[Cache] Error storing pricing:', error);
  }
}

// ============================================================================
// Cache Cleanup
// ============================================================================

/**
 * Clean up expired cache entries
 */
export async function cleanupExpiredCache(): Promise<void> {
  try {
    const now = new Date().toISOString();

    await supabase
      .from('availability_cache')
      .delete()
      .lt('expires_at', now);

    await supabase
      .from('pricing_cache')
      .delete()
      .lt('expires_at', now);

    console.log('[Cache] Cleaned up expired cache entries');
  } catch (error) {
    console.error('[Cache] Error cleaning up cache:', error);
  }
}

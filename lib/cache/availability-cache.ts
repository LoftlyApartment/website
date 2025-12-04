/**
 * Availability Cache Manager
 *
 * Caches Guesty availability data for all properties with automatic refresh every 3.5 minutes.
 * - Fetches availability for next 6 months for each property
 * - Auto-refreshes in background every 210 seconds (3.5 minutes)
 * - Provides instant responses without hitting Guesty API
 * - Prevents 429 Too Many Requests errors from rate limiting
 */

import { addMonths, format } from 'date-fns';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface AvailabilityCacheEntry {
  propertyId: string;
  blockedDates: string[]; // Array of YYYY-MM-DD date strings
  lastFetched: number; // Unix timestamp
  expiresAt: number; // Unix timestamp
}

interface GuestlyAvailability {
  date: string;
  status: 'available' | 'booked' | 'blocked';
  price?: number;
  minNights?: number;
}

// ============================================================================
// Configuration
// ============================================================================

const REFRESH_INTERVAL_MS = 210000; // 3.5 minutes (210 seconds)
const CACHE_DURATION_MS = 300000; // 5 minutes (safety buffer beyond refresh interval)
const MONTHS_TO_FETCH = 6; // Fetch 6 months ahead

// Property mappings (from booking form IDs to Guestly IDs)
const BOOKING_TO_GUESTLY_MAP: Record<string, string> = {
  'kant': '68e0da429e441d00129131d7',
  'hinden': '68e0da486cf6cf001162ee98',
  'kotti': '68e0da5866b8a40012e6ec15'
};

// ============================================================================
// Cache Storage (Singleton)
// ============================================================================

class AvailabilityBackgroundCache {
  private cache: Map<string, AvailabilityCacheEntry> = new Map();
  private refreshInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private isFetching = false;

  /**
   * Initialize the cache and start auto-refresh
   * Called automatically on first access (lazy initialization)
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    const propertyIds = Object.keys(BOOKING_TO_GUESTLY_MAP);
    console.log(`[Availability Cache] Initializing cache for properties: ${propertyIds.join(', ')}`);

    this.isInitialized = true;

    // Fetch initial data
    await this.refreshAllProperties();

    // Set up auto-refresh interval
    this.startAutoRefresh();
  }

  /**
   * Start automatic background refresh every 3.5 minutes
   */
  private startAutoRefresh(): void {
    if (this.refreshInterval) {
      return; // Already running
    }

    console.log(`[Availability Cache] Auto-refresh scheduled every ${REFRESH_INTERVAL_MS / 1000} seconds`);

    this.refreshInterval = setInterval(() => {
      console.log('[Availability Cache] Refreshing availability data...');
      this.refreshAllProperties().catch(error => {
        console.error('[Availability Cache] Auto-refresh failed:', error);
      });
    }, REFRESH_INTERVAL_MS);

    // Ensure interval doesn't prevent process from exiting
    if (this.refreshInterval.unref) {
      this.refreshInterval.unref();
    }
  }

  /**
   * Refresh availability data for all properties
   */
  private async refreshAllProperties(): Promise<void> {
    if (this.isFetching) {
      console.log('[Availability Cache] Fetch already in progress, skipping...');
      return;
    }

    this.isFetching = true;

    try {
      const propertyIds = Object.keys(BOOKING_TO_GUESTLY_MAP);

      for (const bookingPropertyId of propertyIds) {
        try {
          await this.refreshProperty(bookingPropertyId);
        } catch (error) {
          console.error(`[Availability Cache] Failed to refresh ${bookingPropertyId}:`, error);
          // Continue with other properties even if one fails
        }
      }
    } finally {
      this.isFetching = false;
    }
  }

  /**
   * Refresh availability data for a single property
   */
  private async refreshProperty(bookingPropertyId: string): Promise<void> {
    const guestlyPropertyId = BOOKING_TO_GUESTLY_MAP[bookingPropertyId];

    if (!guestlyPropertyId) {
      console.error(`[Availability Cache] Unknown property ID: ${bookingPropertyId}`);
      return;
    }

    console.log(`[Availability Cache] Fetching availability for ${bookingPropertyId}...`);

    // Calculate date range (today to 6 months from now)
    const today = new Date();
    const endDate = addMonths(today, MONTHS_TO_FETCH);

    const startDateStr = format(today, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');

    try {
      // Import the Guestly client dynamically to avoid circular dependencies
      const { getAvailability } = await import('@/integrations/guestly/client');

      // Fetch availability from Guesty API
      const availabilityData: GuestlyAvailability[] = await getAvailability(
        guestlyPropertyId,
        startDateStr,
        endDateStr
      );

      // Extract blocked/booked dates
      const blockedDates = availabilityData
        .filter(day => day.status === 'booked' || day.status === 'blocked')
        .map(day => day.date);

      // Store in cache
      const now = Date.now();
      const cacheEntry: AvailabilityCacheEntry = {
        propertyId: bookingPropertyId,
        blockedDates,
        lastFetched: now,
        expiresAt: now + CACHE_DURATION_MS
      };

      this.cache.set(bookingPropertyId, cacheEntry);

      console.log(`[Availability Cache] Cached ${blockedDates.length} blocked dates for ${bookingPropertyId}`);

    } catch (error) {
      console.error(`[Availability Cache] Error fetching availability for ${bookingPropertyId}:`, error);

      // Keep old cache if fetch fails (graceful degradation)
      const existingCache = this.cache.get(bookingPropertyId);
      if (existingCache) {
        console.log(`[Availability Cache] Keeping old cache for ${bookingPropertyId} (${existingCache.blockedDates.length} dates)`);
      }

      throw error;
    }
  }

  /**
   * Get cached blocked dates for a property within a date range
   */
  getBlockedDates(
    propertyId: string,
    startDate?: string,
    endDate?: string
  ): string[] {
    const cacheEntry = this.cache.get(propertyId);

    if (!cacheEntry) {
      console.warn(`[Availability Cache] No cache found for property: ${propertyId}`);
      return [];
    }

    // Check if cache is expired
    if (Date.now() > cacheEntry.expiresAt) {
      console.warn(`[Availability Cache] Cache expired for ${propertyId}, returning stale data`);
      // Return stale data rather than nothing (background refresh will update soon)
    }

    // Filter by date range if provided
    if (startDate && endDate) {
      const filtered = cacheEntry.blockedDates.filter(date => {
        return date >= startDate && date <= endDate;
      });
      return filtered;
    }

    return cacheEntry.blockedDates;
  }

  /**
   * Get cache statistics for monitoring
   */
  getStatistics(): {
    initialized: boolean;
    properties: Array<{
      propertyId: string;
      blockedDatesCount: number;
      lastFetched: string | null;
      expiresAt: string | null;
      isExpired: boolean;
    }>;
  } {
    const now = Date.now();
    const properties = Object.keys(BOOKING_TO_GUESTLY_MAP).map(propertyId => {
      const entry = this.cache.get(propertyId);

      if (!entry) {
        return {
          propertyId,
          blockedDatesCount: 0,
          lastFetched: null,
          expiresAt: null,
          isExpired: true
        };
      }

      return {
        propertyId,
        blockedDatesCount: entry.blockedDates.length,
        lastFetched: new Date(entry.lastFetched).toISOString(),
        expiresAt: new Date(entry.expiresAt).toISOString(),
        isExpired: now > entry.expiresAt
      };
    });

    return {
      initialized: this.isInitialized,
      properties
    };
  }

  /**
   * Manually trigger a refresh (for testing/debugging)
   */
  async manualRefresh(): Promise<void> {
    console.log('[Availability Cache] Manual refresh triggered');
    await this.refreshAllProperties();
  }

  /**
   * Stop auto-refresh (for cleanup/testing)
   */
  stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('[Availability Cache] Auto-refresh stopped');
    }
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[Availability Cache] Cache cleared');
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

const backgroundCache = new AvailabilityBackgroundCache();

// ============================================================================
// Public API
// ============================================================================

/**
 * Get blocked dates for a property from cache
 * Automatically initializes cache on first access
 * @param propertyId - Booking property ID ('kant', 'hinden')
 * @param startDate - Optional start date filter (YYYY-MM-DD)
 * @param endDate - Optional end date filter (YYYY-MM-DD)
 * @returns Array of blocked date strings
 */
export async function getCachedBlockedDates(
  propertyId: string,
  startDate?: string,
  endDate?: string
): Promise<string[]> {
  // Lazy initialization on first access
  await backgroundCache.initialize();

  return backgroundCache.getBlockedDates(propertyId, startDate, endDate);
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStatistics() {
  return backgroundCache.getStatistics();
}

/**
 * Manually trigger cache refresh
 */
export async function refreshCache(): Promise<void> {
  await backgroundCache.manualRefresh();
}

/**
 * Clear all cached availability data
 */
export function clearAvailabilityCache(): void {
  backgroundCache.clearCache();
}

/**
 * Stop auto-refresh (for cleanup/testing)
 */
export function stopAutoRefresh(): void {
  backgroundCache.stopAutoRefresh();
}

// ============================================================================
// Exports for backward compatibility (if needed)
// ============================================================================

// Legacy exports (these are now no-ops or redirect to new system)
export function getCachedAvailability(): null {
  console.warn('[Availability Cache] getCachedAvailability() is deprecated, use getCachedBlockedDates()');
  return null;
}

export function setCachedAvailability(): void {
  console.warn('[Availability Cache] setCachedAvailability() is deprecated, cache is now background-managed');
}

export function cleanupExpiredCache(): void {
  // No-op, cache auto-refreshes
}

// Export class for testing
export { AvailabilityBackgroundCache };

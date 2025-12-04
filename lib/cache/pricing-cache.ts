/**
 * Pricing Cache Utility
 * In-memory caching layer for Guestly pricing with 1-hour TTL
 */

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface PricingData {
  basePrice: number; // Nightly rate
  totalNights: number;
  subtotalBeforeDiscount: number;
  cleaningFee: number;
  currency: string;
}

interface CachedPricing {
  data: PricingData;
  timestamp: number;
  expiresAt: number;
}

export interface CacheStatistics {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
}

// ============================================================================
// Configuration
// ============================================================================

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour in milliseconds

// ============================================================================
// Cache Storage
// ============================================================================

class PricingCache {
  private cache: Map<string, CachedPricing> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };

  /**
   * Generate cache key from parameters
   * Format: propertyId:checkIn:checkOut:guests
   */
  private getCacheKey(propertyId: string, checkIn: string, checkOut: string, guests: number): string {
    return `${propertyId}:${checkIn}:${checkOut}:${guests}`;
  }

  /**
   * Check if a cache entry is expired
   */
  private isExpired(entry: CachedPricing): boolean {
    return Date.now() > entry.expiresAt;
  }

  /**
   * Get cached pricing data
   * Returns null if not found or expired
   */
  get(propertyId: string, checkIn: string, checkOut: string, guests: number): PricingData | null {
    this.stats.totalRequests++;
    const key = this.getCacheKey(propertyId, checkIn, checkOut, guests);

    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      console.log(`[Pricing Cache MISS] Key: ${key}`);
      return null;
    }

    // Check if expired
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.stats.misses++;
      console.log(`[Pricing Cache EXPIRED] Key: ${key} (expired at ${new Date(entry.expiresAt).toISOString()})`);
      return null;
    }

    this.stats.hits++;
    const age = Math.round((Date.now() - entry.timestamp) / 1000);
    console.log(`[Pricing Cache HIT] Key: ${key} (age: ${age}s)`);
    return entry.data;
  }

  /**
   * Store pricing data in cache
   */
  set(propertyId: string, checkIn: string, checkOut: string, guests: number, data: PricingData): void {
    const key = this.getCacheKey(propertyId, checkIn, checkOut, guests);
    const now = Date.now();

    const entry: CachedPricing = {
      data,
      timestamp: now,
      expiresAt: now + CACHE_TTL_MS
    };

    this.cache.set(key, entry);
    console.log(`[Pricing Cache SET] Key: ${key} (expires at ${new Date(entry.expiresAt).toISOString()})`);
  }

  /**
   * Clear cache entries
   * If propertyId is provided, only clear entries for that property
   * If no propertyId provided, clear all entries
   */
  clear(propertyId?: string): void {
    if (!propertyId) {
      const size = this.cache.size;
      this.cache.clear();
      console.log(`[Pricing Cache CLEAR] Cleared all ${size} entries`);
      return;
    }

    // Clear entries matching the property ID
    let cleared = 0;
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.startsWith(`${propertyId}:`)) {
        this.cache.delete(key);
        cleared++;
      }
    }
    console.log(`[Pricing Cache CLEAR] Cleared ${cleared} entries for property ${propertyId}`);
  }

  /**
   * Manually clean up expired entries
   * This is called automatically during get(), but can be triggered manually
   */
  clearExpired(): void {
    const now = Date.now();
    let cleared = 0;

    const entries = Array.from(this.cache.entries());
    for (const [key, entry] of entries) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleared++;
      }
    }

    if (cleared > 0) {
      console.log(`[Pricing Cache CLEANUP] Removed ${cleared} expired entries`);
    }
  }

  /**
   * Get cache performance statistics
   */
  getStatistics(): CacheStatistics {
    const hitRate = this.stats.totalRequests > 0
      ? (this.stats.hits / this.stats.totalRequests) * 100
      : 0;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests: this.stats.totalRequests,
      hitRate: Math.round(hitRate * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Reset statistics (useful for testing or debugging)
   */
  resetStatistics(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
    console.log('[Pricing Cache STATS] Statistics reset');
  }

  /**
   * Get current cache size
   */
  getSize(): number {
    return this.cache.size;
  }

  /**
   * Get all cache keys (useful for debugging)
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const pricingCache = new PricingCache();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Get cached pricing data
 */
export function getCachedPricing(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  guests: number
): PricingData | null {
  return pricingCache.get(propertyId, checkIn, checkOut, guests);
}

/**
 * Store pricing data in cache
 */
export function setCachedPricing(
  propertyId: string,
  checkIn: string,
  checkOut: string,
  guests: number,
  data: PricingData
): void {
  pricingCache.set(propertyId, checkIn, checkOut, guests, data);
}

/**
 * Clear cache for a specific property or all entries
 */
export function clearPricingCache(propertyId?: string): void {
  pricingCache.clear(propertyId);
}

/**
 * Get cache statistics
 */
export function getPricingCacheStatistics(): CacheStatistics {
  return pricingCache.getStatistics();
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredPricingCache(): void {
  pricingCache.clearExpired();
}

// ============================================================================
// Optional: Automatic Cleanup Interval
// ============================================================================

// Run cleanup every 5 minutes to keep cache size manageable
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    pricingCache.clearExpired();
  }, 5 * 60 * 1000); // Run every 5 minutes
}

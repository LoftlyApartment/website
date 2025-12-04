# Guestly Availability Caching

A 5-minute in-memory caching layer for Guestly availability checks to improve performance and reduce API calls.

## Overview

The caching system stores Guestly availability responses in memory for 5 minutes, significantly reducing API calls and improving response times for repeated availability checks.

## Features

- **5-Minute TTL**: Cache entries automatically expire after 5 minutes
- **Automatic Cleanup**: Expired entries are removed automatically
- **Smart Invalidation**: Cache is cleared when reservations are created/updated
- **Statistics Tracking**: Monitor cache performance with hit/miss rates
- **Zero Configuration**: Works out of the box with no setup required

## Files

- `availability-cache.ts`: Core caching implementation
- `README.md`: This documentation

## Usage

### Basic Usage

The caching is transparent and automatic when using the Guestly client:

```typescript
import { getAvailability } from '@/integrations/guestly/client';

// First call - fetches from API (cache MISS)
const availability1 = await getAvailability('property-id', '2025-01-01', '2025-01-07');

// Second call - returns from cache (cache HIT)
const availability2 = await getAvailability('property-id', '2025-01-01', '2025-01-07');
```

### Manual Cache Control

```typescript
import { clearCache, getCacheStatistics } from '@/integrations/guestly/client';

// Clear cache for a specific property
clearCache('property-id');

// Clear all cache entries
clearCache();

// Get cache statistics
const stats = getCacheStatistics();
console.log(`Hit Rate: ${stats.hitRate}%`);
console.log(`Total Requests: ${stats.totalRequests}`);
```

### Advanced Usage

```typescript
import {
  getCachedAvailability,
  setCachedAvailability,
  cleanupExpiredCache
} from '@/lib/cache/availability-cache';

// Manually get cached data
const cached = getCachedAvailability('property-id', '2025-01-01', '2025-01-07');

// Manually set cache
setCachedAvailability('property-id', '2025-01-01', '2025-01-07', availabilityData);

// Manually trigger cleanup of expired entries
cleanupExpiredCache();
```

## Cache Key Format

Cache keys are generated using the format:
```
{propertyId}:{startDate}:{endDate}
```

Example:
```
68e0da429e441d00129131d7:2025-01-01:2025-01-07
```

## Cache Invalidation

The cache is automatically cleared in the following scenarios:

1. **Reservation Created**: `createReservation()` clears cache for that property
2. **Reservation Updated**: `updateReservation()` clears cache for that property
3. **Manual Clear**: Call `clearCache()` to manually clear entries
4. **TTL Expiry**: Entries older than 5 minutes are automatically removed

## Performance Benefits

### Expected Improvements

- **Response Time**: 95-99% reduction for cached requests (typically <1ms vs 100-500ms)
- **API Calls**: Up to 90% reduction in Guestly API calls
- **Rate Limiting**: Helps stay within API rate limits
- **User Experience**: Faster page loads and availability checks

### Example Performance

```
First Request (API call):  320ms
Second Request (cached):   <1ms  (99.7% faster)
Third Request (cached):    <1ms  (99.7% faster)
```

## Cache Statistics

The caching system tracks the following metrics:

```typescript
interface CacheStatistics {
  hits: number;        // Number of cache hits
  misses: number;      // Number of cache misses
  totalRequests: number; // Total requests processed
  hitRate: number;     // Hit rate percentage (0-100)
}
```

### Viewing Statistics

```typescript
import { getCacheStatistics } from '@/integrations/guestly/client';

const stats = getCacheStatistics();
console.log(`Cache Hit Rate: ${stats.hitRate}%`);
console.log(`Total Requests: ${stats.totalRequests}`);
console.log(`Cache Hits: ${stats.hits}`);
console.log(`Cache Misses: ${stats.misses}`);
```

## Testing

Run the cache test script to verify functionality:

```bash
npx tsx integrations/guestly/test-cache.ts
```

The test script will:
1. Make initial API call (cache MISS)
2. Make repeated calls (cache HITs)
3. Display performance improvements
4. Show cache statistics
5. Test cache clearing

## Logging

The cache logs all operations to the console:

```
[Cache MISS] Key: 68e0da429e441d00129131d7:2025-01-01:2025-01-07
[Cache SET] Key: 68e0da429e441d00129131d7:2025-01-01:2025-01-07 (expires at 2025-01-01T12:05:00.000Z)
[Cache HIT] Key: 68e0da429e441d00129131d7:2025-01-01:2025-01-07 (age: 23s)
[Cache EXPIRED] Key: 68e0da429e441d00129131d7:2025-01-01:2025-01-07 (expired at 2025-01-01T12:05:00.000Z)
[Cache CLEAR] Cleared 3 entries for property 68e0da429e441d00129131d7
[Cache CLEANUP] Removed 5 expired entries
```

## Configuration

### TTL (Time To Live)

The default TTL is 5 minutes. To change it, edit `availability-cache.ts`:

```typescript
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
```

### Automatic Cleanup

Expired entries are cleaned up:
- Automatically when accessing expired entries
- Every 60 seconds via automatic cleanup interval
- Manually via `cleanupExpiredCache()`

## Architecture

### In-Memory Storage

The cache uses a JavaScript `Map` for O(1) lookups:

```typescript
private cache: Map<string, CachedAvailability> = new Map();
```

### Cache Entry Structure

```typescript
interface CachedAvailability {
  data: GuestlyAvailability[];  // The cached availability data
  timestamp: number;             // When the entry was created
  expiresAt: number;             // When the entry expires
}
```

## Best Practices

1. **Don't Clear Cache Unnecessarily**: Let the TTL handle expiry automatically
2. **Monitor Hit Rate**: Aim for >80% hit rate in production
3. **Consider User Behavior**: 5-minute TTL balances freshness vs performance
4. **Log Analysis**: Review cache logs to optimize cache strategy
5. **Error Handling**: Errors are never cached, always fresh from API

## Troubleshooting

### Cache Not Working

```typescript
// Check if cache is being used
const stats = getCacheStatistics();
console.log('Total requests:', stats.totalRequests);

// Clear cache and retry
clearCache();
```

### Stale Data

```typescript
// Force fresh data by clearing cache first
clearCache('property-id');
const freshData = await getAvailability('property-id', startDate, endDate);
```

### Memory Concerns

The cache automatically:
- Expires entries after 5 minutes
- Cleans up every 60 seconds
- Only stores successful responses

Each cache entry is typically <10KB, so even 100 cached entries use <1MB of memory.

## API Reference

### Functions

#### `getCachedAvailability(propertyId, startDate, endDate)`
Returns cached availability data or null if not found/expired.

#### `setCachedAvailability(propertyId, startDate, endDate, data)`
Stores availability data in cache with 5-minute TTL.

#### `clearAvailabilityCache(propertyId?)`
Clears cache entries. If propertyId provided, only clears that property.

#### `getCacheStatistics()`
Returns cache performance statistics.

#### `cleanupExpiredCache()`
Manually triggers cleanup of expired entries.

## Future Enhancements

Potential improvements for the future:

1. **Redis Integration**: Move to Redis for multi-server caching
2. **Configurable TTL**: Per-property TTL configuration
3. **Cache Warming**: Pre-load popular date ranges
4. **Metrics Export**: Export stats to monitoring system
5. **Smart Invalidation**: Only invalidate overlapping date ranges

## Support

For issues or questions:
1. Check the logs for cache operations
2. Run the test script: `npx tsx integrations/guestly/test-cache.ts`
3. Review cache statistics: `getCacheStatistics()`
4. Clear cache if data seems stale: `clearCache()`

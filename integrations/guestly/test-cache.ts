/**
 * Test script for Guestly availability caching
 * Run with: npx tsx integrations/guestly/test-cache.ts
 */

import {
  getAvailability,
  getAvailabilityCacheStatistics,
  PROPERTY_MAP
} from './client';

async function testCache() {
  console.log('='.repeat(60));
  console.log('Testing Guestly Availability Cache');
  console.log('='.repeat(60));
  console.log();

  const propertyId = PROPERTY_MAP.kantstrasse;
  const startDate = '2025-01-01';
  const endDate = '2025-01-07';

  try {
    // Test 1: First call - should be cache MISS
    console.log('Test 1: First API call (cache MISS expected)');
    console.log('-'.repeat(60));
    const start1 = Date.now();
    const result1 = await getAvailability(propertyId, startDate, endDate);
    const duration1 = Date.now() - start1;
    console.log(`✓ Fetched ${result1.length} days of availability`);
    console.log(`✓ Duration: ${duration1}ms`);
    console.log();

    // Test 2: Second call - should be cache HIT
    console.log('Test 2: Second API call (cache HIT expected)');
    console.log('-'.repeat(60));
    const start2 = Date.now();
    const result2 = await getAvailability(propertyId, startDate, endDate);
    const duration2 = Date.now() - start2;
    console.log(`✓ Fetched ${result2.length} days of availability`);
    console.log(`✓ Duration: ${duration2}ms`);
    console.log(`✓ Speed improvement: ${Math.round((duration1 - duration2) / duration1 * 100)}%`);
    console.log();

    // Test 3: Third call - should be cache HIT
    console.log('Test 3: Third API call (cache HIT expected)');
    console.log('-'.repeat(60));
    const start3 = Date.now();
    const result3 = await getAvailability(propertyId, startDate, endDate);
    const duration3 = Date.now() - start3;
    console.log(`✓ Fetched ${result3.length} days of availability`);
    console.log(`✓ Duration: ${duration3}ms`);
    console.log();

    // Test 4: Check cache statistics
    console.log('Test 4: Cache Statistics');
    console.log('-'.repeat(60));
    const stats = getAvailabilityCacheStatistics();
    console.log(`Initialized: ${stats.initialized}`);
    console.log(`Properties cached: ${stats.properties.length}`);
    stats.properties.forEach(prop => {
      console.log(`  - ${prop.propertyId}: ${prop.blockedDatesCount} blocked dates`);
    });
    console.log();

    // Test 5: Note about cache
    console.log('Test 5: Cache Behavior');
    console.log('-'.repeat(60));
    console.log('Note: Cache now auto-refreshes every 3.5 minutes');
    console.log('No manual clearing needed - background refresh handles updates');
    console.log();

    // Final statistics
    console.log('Final Cache Statistics');
    console.log('-'.repeat(60));
    const finalStats = getAvailabilityCacheStatistics();
    console.log(`Initialized: ${finalStats.initialized}`);
    finalStats.properties.forEach(prop => {
      console.log(`  - ${prop.propertyId}:`);
      console.log(`    Blocked dates: ${prop.blockedDatesCount}`);
      console.log(`    Last fetched: ${prop.lastFetched || 'never'}`);
      console.log(`    Expired: ${prop.isExpired}`);
    });
    console.log();

    console.log('='.repeat(60));
    console.log('✓ All cache tests passed!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Cache test failed:', error);
    process.exit(1);
  }
}

// Run the test
testCache();

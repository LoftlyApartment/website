/**
 * Guestly API Connection Test Script
 *
 * This script tests the Guestly API integration by:
 * 1. Testing API authentication
 * 2. Fetching all properties
 * 3. Verifying specific property IDs (Kantstraße and Hindenburgufer)
 * 4. Testing individual property retrieval
 * 5. Testing availability checking for a future date range
 *
 * Run this script with: npx tsx integrations/guestly/test-connection.ts
 */

// Load environment variables from .env.local
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import {
  getProperties,
  getProperty,
  getAvailability,
  getOAuthTokenInfo,
  PROPERTY_MAP,
  type GuestlyProperty,
  type GuestlyAvailability,
  formatDateForApi
} from './client';

// ============================================================================
// Test Configuration
// ============================================================================

const EXPECTED_PROPERTIES = {
  kantstrasse: {
    id: '68e0da429e441d00129131d7',
    name: 'Kantstraße'
  },
  hindenburgufer: {
    id: '68e0da486cf6cf001162ee98',
    name: 'Hindenburgufer'
  }
};

// Generate future date range for availability test (30 days from now, for 7 days)
const today = new Date();
const futureStartDate = new Date(today);
futureStartDate.setDate(today.getDate() + 30);
const futureEndDate = new Date(futureStartDate);
futureEndDate.setDate(futureStartDate.getDate() + 7);

const START_DATE = formatDateForApi(futureStartDate);
const END_DATE = formatDateForApi(futureEndDate);

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Print a formatted section header
 */
function printHeader(title: string): void {
  const line = '='.repeat(80);
  console.log('\n' + line);
  console.log(`  ${title}`);
  console.log(line + '\n');
}

/**
 * Print test result
 */
function printResult(testName: string, success: boolean, details?: string): void {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${testName}`);
  if (details) {
    console.log(`   ${details}`);
  }
  console.log();
}

/**
 * Print property summary
 */
function printPropertySummary(property: GuestlyProperty): void {
  console.log(`   Property ID: ${property._id}`);
  console.log(`   Title: ${property.title}`);
  console.log(`   Nickname: ${property.nickname || 'N/A'}`);
  console.log(`   Address: ${property.address?.full || 'N/A'}`);
  console.log(`   Type: ${property.propertyType || 'N/A'}`);
  console.log(`   Accommodates: ${property.accommodates || 'N/A'} guests`);
  console.log(`   Bedrooms: ${property.bedrooms || 'N/A'}`);
  console.log(`   Bathrooms: ${property.bathrooms || 'N/A'}`);
  console.log(`   Active: ${property.active ? 'Yes' : 'No'}`);
  console.log(`   Listed: ${property.listed ? 'Yes' : 'No'}`);
  if (property.prices?.basePrice) {
    console.log(`   Base Price: ${property.prices.currency || 'EUR'} ${property.prices.basePrice}`);
  }
  console.log();
}

/**
 * Print availability summary
 */
function printAvailabilitySummary(availability: GuestlyAvailability[]): void {
  console.log(`   Date Range: ${START_DATE} to ${END_DATE}`);
  console.log(`   Total Days: ${availability.length}`);

  const availableDays = availability.filter(day => day.status === 'available').length;
  const bookedDays = availability.filter(day => day.status === 'booked').length;
  const blockedDays = availability.filter(day => day.status === 'blocked').length;

  console.log(`   Available: ${availableDays} days`);
  console.log(`   Booked: ${bookedDays} days`);
  console.log(`   Blocked: ${blockedDays} days`);

  // Show first few days as sample
  console.log('\n   Sample days:');
  availability.slice(0, 3).forEach(day => {
    console.log(`     ${day.date}: ${day.status}${day.price ? ` (${day.price})` : ''}`);
  });
  console.log();
}

// ============================================================================
// Test Functions
// ============================================================================

/**
 * Test 1: Verify OAuth Configuration
 */
async function testOAuthConfiguration(): Promise<boolean> {
  printHeader('TEST 1: OAuth 2.0 Configuration');

  try {
    const clientId = process.env.GUESTY_CLIENT_ID;
    const clientSecret = process.env.GUESTY_CLIENT_SECRET;

    if (!clientId) {
      printResult('Client ID Check', false, 'GUESTY_CLIENT_ID environment variable is not set');
      return false;
    }

    if (!clientSecret) {
      printResult('Client Secret Check', false, 'GUESTY_CLIENT_SECRET environment variable is not set');
      return false;
    }

    if (clientId.length < 10) {
      printResult('Client ID Check', false, 'Client ID appears to be invalid (too short)');
      return false;
    }

    if (clientSecret.length < 20) {
      printResult('Client Secret Check', false, 'Client secret appears to be invalid (too short)');
      return false;
    }

    printResult('Client ID Check', true, `Client ID found: ${clientId.slice(0, 10)}...`);
    printResult('Client Secret Check', true, `Client secret found: ${clientSecret.slice(0, 10)}...`);

    // Test OAuth token exchange
    console.log('\nTesting OAuth token exchange...\n');

    const tokenInfo = await getOAuthTokenInfo();

    if (tokenInfo.isAuthenticated) {
      printResult('OAuth Token Exchange', true, 'Successfully obtained access token');
      console.log('   Token Info:');
      console.log(`     Has Token: ${tokenInfo.tokenInfo.hasToken}`);
      console.log(`     Token Preview: ${tokenInfo.tokenInfo.tokenPreview}`);
      if (tokenInfo.tokenInfo.cacheStats) {
        console.log(`     Cache Expires At: ${tokenInfo.tokenInfo.cacheStats.expiresAt || 'N/A'}`);
      }
      console.log();
      return true;
    } else {
      printResult('OAuth Token Exchange', false,
        `Failed to obtain token: ${tokenInfo.tokenInfo.error}`);
      return false;
    }

  } catch (error) {
    printResult('OAuth Configuration', false, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Test 2: Fetch All Properties
 */
async function testGetProperties(): Promise<GuestlyProperty[] | null> {
  printHeader('TEST 2: Fetch All Properties');

  try {
    console.log('Fetching all properties from Guestly...\n');

    const properties = await getProperties();

    if (!properties || properties.length === 0) {
      printResult('Get Properties', false, 'No properties returned from API');
      return null;
    }

    printResult('Get Properties', true, `Successfully fetched ${properties.length} properties`);

    console.log('Properties found:');
    properties.forEach((property, index) => {
      console.log(`   ${index + 1}. ${property.title || property.nickname || property._id}`);
      console.log(`      ID: ${property._id}`);
      console.log(`      Address: ${property.address?.full || 'N/A'}`);
    });
    console.log();

    return properties;

  } catch (error) {
    printResult('Get Properties', false, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Full error:', error);
    return null;
  }
}

/**
 * Test 3: Verify Expected Property IDs
 */
function testVerifyPropertyIds(properties: GuestlyProperty[]): boolean {
  printHeader('TEST 3: Verify Expected Property IDs');

  try {
    const propertyIds = properties.map(p => p._id);

    let allFound = true;

    // Check Kantstraße
    const kantFound = propertyIds.includes(EXPECTED_PROPERTIES.kantstrasse.id);
    printResult(
      `${EXPECTED_PROPERTIES.kantstrasse.name} (${EXPECTED_PROPERTIES.kantstrasse.id})`,
      kantFound,
      kantFound ? 'Property found in list' : 'Property NOT found - ID may be incorrect'
    );

    if (!kantFound) allFound = false;

    // Check Hindenburgufer
    const hindFound = propertyIds.includes(EXPECTED_PROPERTIES.hindenburgufer.id);
    printResult(
      `${EXPECTED_PROPERTIES.hindenburgufer.name} (${EXPECTED_PROPERTIES.hindenburgufer.id})`,
      hindFound,
      hindFound ? 'Property found in list' : 'Property NOT found - ID may be incorrect'
    );

    if (!hindFound) allFound = false;

    // Verify PROPERTY_MAP matches
    console.log('Checking PROPERTY_MAP configuration:');
    console.log(`   kantstrasse: ${PROPERTY_MAP.kantstrasse}`);
    console.log(`   hindenburgufer: ${PROPERTY_MAP.hindenburgufer}`);
    console.log();

    const mapMatches =
      PROPERTY_MAP.kantstrasse === EXPECTED_PROPERTIES.kantstrasse.id &&
      PROPERTY_MAP.hindenburgufer === EXPECTED_PROPERTIES.hindenburgufer.id;

    printResult('PROPERTY_MAP Configuration', mapMatches,
      mapMatches ? 'Property IDs match expected values' : 'Property IDs do NOT match');

    return allFound && mapMatches;

  } catch (error) {
    printResult('Verify Property IDs', false, `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return false;
  }
}

/**
 * Test 4: Get Individual Property Details
 */
async function testGetPropertyDetails(): Promise<boolean> {
  printHeader('TEST 4: Get Individual Property Details');

  let allSuccess = true;

  // Test Kantstraße
  try {
    console.log(`Fetching details for ${EXPECTED_PROPERTIES.kantstrasse.name}...\n`);

    const kantProperty = await getProperty(EXPECTED_PROPERTIES.kantstrasse.id);

    printResult(`Get ${EXPECTED_PROPERTIES.kantstrasse.name}`, true, 'Property details retrieved successfully');
    printPropertySummary(kantProperty);

  } catch (error) {
    printResult(`Get ${EXPECTED_PROPERTIES.kantstrasse.name}`, false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Full error:', error);
    allSuccess = false;
  }

  // Test Hindenburgufer
  try {
    console.log(`Fetching details for ${EXPECTED_PROPERTIES.hindenburgufer.name}...\n`);

    const hindProperty = await getProperty(EXPECTED_PROPERTIES.hindenburgufer.id);

    printResult(`Get ${EXPECTED_PROPERTIES.hindenburgufer.name}`, true, 'Property details retrieved successfully');
    printPropertySummary(hindProperty);

  } catch (error) {
    printResult(`Get ${EXPECTED_PROPERTIES.hindenburgufer.name}`, false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Full error:', error);
    allSuccess = false;
  }

  return allSuccess;
}

/**
 * Test 5: Get Availability Data
 */
async function testGetAvailability(): Promise<boolean> {
  printHeader('TEST 5: Get Availability Data');

  console.log(`Testing availability check for date range:`);
  console.log(`  Start: ${START_DATE}`);
  console.log(`  End: ${END_DATE}\n`);

  let allSuccess = true;

  // Test Kantstraße availability
  try {
    console.log(`Checking availability for ${EXPECTED_PROPERTIES.kantstrasse.name}...\n`);

    const availability = await getAvailability(
      EXPECTED_PROPERTIES.kantstrasse.id,
      START_DATE,
      END_DATE
    );

    if (!availability || availability.length === 0) {
      printResult(`${EXPECTED_PROPERTIES.kantstrasse.name} Availability`, false,
        'No availability data returned');
      allSuccess = false;
    } else {
      printResult(`${EXPECTED_PROPERTIES.kantstrasse.name} Availability`, true,
        'Availability data retrieved successfully');
      printAvailabilitySummary(availability);
    }

  } catch (error) {
    printResult(`${EXPECTED_PROPERTIES.kantstrasse.name} Availability`, false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Full error:', error);
    allSuccess = false;
  }

  // Test Hindenburgufer availability
  try {
    console.log(`Checking availability for ${EXPECTED_PROPERTIES.hindenburgufer.name}...\n`);

    const availability = await getAvailability(
      EXPECTED_PROPERTIES.hindenburgufer.id,
      START_DATE,
      END_DATE
    );

    if (!availability || availability.length === 0) {
      printResult(`${EXPECTED_PROPERTIES.hindenburgufer.name} Availability`, false,
        'No availability data returned');
      allSuccess = false;
    } else {
      printResult(`${EXPECTED_PROPERTIES.hindenburgufer.name} Availability`, true,
        'Availability data retrieved successfully');
      printAvailabilitySummary(availability);
    }

  } catch (error) {
    printResult(`${EXPECTED_PROPERTIES.hindenburgufer.name} Availability`, false,
      `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.error('Full error:', error);
    allSuccess = false;
  }

  return allSuccess;
}

// ============================================================================
// Main Test Runner
// ============================================================================

async function runAllTests(): Promise<void> {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                   GUESTLY API CONNECTION TEST SUITE                        ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  console.log(`Test Date: ${new Date().toISOString()}`);
  console.log(`Node Version: ${process.version}`);
  console.log('\n');

  const results = {
    oauth: false,
    getProperties: false,
    verifyIds: false,
    getDetails: false,
    getAvailability: false
  };

  // Test 1: OAuth Configuration
  results.oauth = await testOAuthConfiguration();

  if (!results.oauth) {
    console.log('\n⚠️  Cannot proceed with API tests - OAuth is not configured properly');
    console.log('Please check your .env.local file and ensure GUESTY_CLIENT_ID and GUESTY_CLIENT_SECRET are set.\n');
    process.exit(1);
  }

  // Test 2: Get All Properties
  const properties = await testGetProperties();
  results.getProperties = properties !== null;

  if (!results.getProperties || !properties) {
    console.log('\n⚠️  Cannot proceed with further tests - unable to fetch properties');
    console.log('Please check your API key and network connection.\n');
    process.exit(1);
  }

  // Test 3: Verify Property IDs
  results.verifyIds = testVerifyPropertyIds(properties);

  // Test 4: Get Individual Property Details
  results.getDetails = await testGetPropertyDetails();

  // Test 5: Get Availability Data
  results.getAvailability = await testGetAvailability();

  // ============================================================================
  // Final Results Summary
  // ============================================================================

  printHeader('FINAL RESULTS SUMMARY');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(r => r).length;
  const failedTests = totalTests - passedTests;

  console.log('Test Results:');
  console.log(`   ✅ OAuth 2.0 Configuration: ${results.oauth ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ Get Properties: ${results.getProperties ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ Verify Property IDs: ${results.verifyIds ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ Get Property Details: ${results.getDetails ? 'PASS' : 'FAIL'}`);
  console.log(`   ✅ Get Availability: ${results.getAvailability ? 'PASS' : 'FAIL'}`);
  console.log();
  console.log(`Total: ${passedTests}/${totalTests} tests passed`);

  if (failedTests > 0) {
    console.log(`\n❌ ${failedTests} test(s) failed\n`);
    process.exit(1);
  } else {
    console.log('\n✅ All tests passed successfully!\n');
    console.log('🎉 Guestly API integration is working correctly.\n');
  }
}

// ============================================================================
// Execute Tests
// ============================================================================

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('\n❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('\n❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Run the test suite
runAllTests().catch(error => {
  console.error('\n❌ Test suite failed:', error);
  process.exit(1);
});

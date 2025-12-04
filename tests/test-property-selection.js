/**
 * Test script to verify property pre-selection on booking page
 *
 * This tests that when a user clicks "Reserve Now" from a property page,
 * the booking page correctly pre-selects that property.
 */

const testUrl = 'http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2';

console.log('\n=== PROPERTY PRE-SELECTION TEST ===\n');
console.log('Testing URL:', testUrl);
console.log('\nExpected behavior:');
console.log('1. Page should load without errors');
console.log('2. "Kant Apartment" should have blue border (selected)');
console.log('3. "Kant Apartment" should show checkmark icon');
console.log('4. Check-in date should be 2025-11-15');
console.log('5. Check-out date should be 2025-11-18');
console.log('6. Guests should be 2');
console.log('\nCheck browser console for debug logs:');
console.log('- [BOOKING PAGE] Setting propertyId from URL: kant');
console.log('- [BOOKING CONTEXT] updateStep1 called with: { propertyId: "kant", ... }');
console.log('- [STEP1] Context state changed, resetting form with: { propertyId: "kant", ... }');
console.log('- [STEP1] Current propertyId in form: kant');
console.log('- [STEP1] Available properties: ["kant", "hinden"]');
console.log('\nOpen the URL in your browser and check the console logs!\n');

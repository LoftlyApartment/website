// Test the date parsing fix
console.log('\n=== Testing Date Parsing Fix ===\n');

// Simulate the old way (with timezone issues)
function oldDateParse(dateString) {
  return new Date(dateString);
}

// Simulate the new way (without timezone issues)
function newDateParse(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Test dates from the user's example
const checkInString = '2025-11-03';
const checkOutString = '2025-11-14';

console.log('Input dates:');
console.log('  Check-in: ', checkInString);
console.log('  Check-out:', checkOutString);
console.log('  Expected nights: 11\n');

console.log('OLD METHOD (with timezone issues):');
const oldCheckIn = oldDateParse(checkInString);
const oldCheckOut = oldDateParse(checkOutString);
console.log('  Check-in: ', oldCheckIn.toISOString());
console.log('  Check-out:', oldCheckOut.toISOString());
const oldNights = Math.floor((oldCheckOut.getTime() - oldCheckIn.getTime()) / (1000 * 60 * 60 * 24));
console.log('  Calculated nights:', oldNights);
console.log('  ❌ Problem: May be off by 1 day due to timezone\n');

console.log('NEW METHOD (timezone-safe):');
const newCheckIn = newDateParse(checkInString);
const newCheckOut = newDateParse(checkOutString);
console.log('  Check-in: ', newCheckIn.toISOString());
console.log('  Check-out:', newCheckOut.toISOString());

// Use date-fns differenceInDays approach
function differenceInDays(laterDate, earlierDate) {
  const utcLater = Date.UTC(laterDate.getFullYear(), laterDate.getMonth(), laterDate.getDate());
  const utcEarlier = Date.UTC(earlierDate.getFullYear(), earlierDate.getMonth(), earlierDate.getDate());
  return Math.floor((utcLater - utcEarlier) / (1000 * 60 * 60 * 24));
}

const newNights = differenceInDays(newCheckOut, newCheckIn);
console.log('  Calculated nights:', newNights);
console.log('  ✅ Correct:', newNights === 11 ? 'YES' : 'NO');

console.log('\n=== Test Complete ===\n');

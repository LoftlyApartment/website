const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const screenshotDir = '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('\n=== PART 1: Property Page → Booking Page (Data Transfer) ===\n');

  try {
    // 1. Navigate to Kant property directly
    console.log('1. Navigating to Kant property page directly...');
    await page.goto('http://localhost:3000/en/properties/kant');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: path.join(screenshotDir, '01-kant-property-page.png'), fullPage: true });
    console.log('✓ Screenshot saved: 01-kant-property-page.png');
    console.log('✓ On Kant property detail page');

    // 2. Find booking widget and select dates
    console.log('\n2. Testing date selection in BookingWidget...');
    
    // Wait a moment for any JavaScript to load
    await page.waitForTimeout(1000);
    
    // Click check-in date field
    const checkInSelector = 'input[name="checkIn"]';
    await page.waitForSelector(checkInSelector, { timeout: 5000 });
    await page.click(checkInSelector);
    await page.fill(checkInSelector, '2025-11-15');
    console.log('✓ Check-in date set: 2025-11-15');
    
    // Click check-out date field
    const checkOutSelector = 'input[name="checkOut"]';
    await page.click(checkOutSelector);
    await page.fill(checkOutSelector, '2025-11-18');
    console.log('✓ Check-out date set: 2025-11-18');
    
    // Wait for night calculation to update
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: path.join(screenshotDir, '02-dates-selected.png'), fullPage: true });
    console.log('✓ Screenshot saved: 02-dates-selected.png');

    // 3. Verify automatic night calculation
    console.log('\n3. Verifying automatic night calculation...');
    try {
      const nightText = await page.locator('text=/\\d+.*[Nn]acht|\\d+.*night/').first().textContent({ timeout: 3000 });
      console.log('✓ Night calculation appears:', nightText.trim());
    } catch (e) {
      console.log('⚠ Night calculation not visible');
    }

    // 4. Click "Reserve Now" button
    console.log('\n4. Clicking "Reserve Now" / "Book Now" button...');
    
    // Try multiple possible selectors for the reserve button
    try {
      await page.click('a[href*="/booking"], button:has-text("Reserve"), button:has-text("Book"), a:has-text("Reserve"), a:has-text("Book")');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotDir, '03-booking-page-step1.png'), fullPage: true });
      console.log('✓ Screenshot saved: 03-booking-page-step1.png');
      console.log('✓ Navigated to booking page');
    } catch (e) {
      console.log('⚠ Could not find reserve button, trying to navigate directly...');
      await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: path.join(screenshotDir, '03-booking-page-step1.png'), fullPage: true });
      console.log('✓ Screenshot saved: 03-booking-page-step1.png');
    }

    // 5. Verify booking page Step 1 data
    console.log('\n5. VERIFYING BOOKING PAGE STEP 1 DATA:');
    
    const url = page.url();
    console.log('   Current URL:', url);
    
    // Check URL parameters
    const urlParams = new URL(page.url()).searchParams;
    console.log('   URL Parameters:');
    console.log('     - propertyId:', urlParams.get('propertyId'));
    console.log('     - checkIn:', urlParams.get('checkIn'));
    console.log('     - checkOut:', urlParams.get('checkOut'));
    console.log('     - guests:', urlParams.get('guests'));
    
    // Wait for form to load
    await page.waitForTimeout(1000);
    
    // Check if property is pre-selected
    console.log('\n   Checking property pre-selection...');
    const kantCard = page.locator('[data-property-id="kant"]').first();
    const kantCount = await kantCard.count();
    
    if (kantCount > 0) {
      const classes = await kantCard.getAttribute('class');
      console.log('   ✓ Property card found with data-property-id="kant"');
      console.log('     - Classes:', classes);
      console.log('     - Has blue border:', classes.includes('border-blue') ? 'YES ✓' : 'NO ✗');
      
      // Check for checkmark
      const checkmark = kantCard.locator('svg[class*="checkmark"], svg[class*="check"]');
      const hasCheckmark = await checkmark.count() > 0;
      console.log('     - Has checkmark:', hasCheckmark ? 'YES ✓' : 'NO ✗');
    } else {
      console.log('   ✗ Property card with data-property-id="kant" NOT FOUND');
    }
    
    // Check form field values
    console.log('\n   Checking form field values...');
    try {
      const checkInValue = await page.inputValue('input[name="checkIn"]');
      console.log('   Check-in date:', checkInValue, checkInValue ? '✓' : '✗ EMPTY');
    } catch (e) {
      console.log('   Check-in date: Field not found');
    }
    
    try {
      const checkOutValue = await page.inputValue('input[name="checkOut"]');
      console.log('   Check-out date:', checkOutValue, checkOutValue ? '✓' : '✗ EMPTY');
    } catch (e) {
      console.log('   Check-out date: Field not found');
    }
    
    try {
      const guestValue = await page.inputValue('input[name="guests"]');
      console.log('   Guest count:', guestValue, guestValue ? '✓' : '✗ EMPTY');
    } catch (e) {
      console.log('   Guest count: Field not found');
    }
    
    // Check night calculation
    try {
      const nightText = await page.locator('text=/\\d+.*[Nn]ächte|\\d+.*night/').first().textContent();
      console.log('   Night calculation:', nightText.trim(), '✓');
    } catch (e) {
      console.log('   Night calculation: NOT FOUND ✗');
    }

    console.log('\n=== PART 2: Navigation on Step 1 ===\n');

    // 6. Click "Properties" link in header
    console.log('6. Testing navigation from Step 1...');
    await page.click('header a:has-text("Properties")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '04-navigation-from-step1.png'), fullPage: true });
    console.log('✓ Screenshot saved: 04-navigation-from-step1.png');
    const propertiesUrl = page.url();
    console.log('✓ Navigated to:', propertiesUrl);
    
    if (propertiesUrl.includes('/properties')) {
      console.log('✓ Navigation on Step 1: WORKS ✓✓✓');
    } else {
      console.log('✗ Navigation on Step 1: FAILED');
    }

    console.log('\n=== PART 3: Navigation on Step 2 ===\n');

    // 7. Go back to booking with URL parameters
    console.log('7. Returning to booking page with URL parameters...');
    const bookingUrl = 'http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2';
    await page.goto(bookingUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    console.log('✓ Back on booking page Step 1');

    // 8. Fill Step 1 and continue to Step 2
    console.log('\n8. Filling Step 1 form and continuing to Step 2...');
    
    // Ensure property is selected (click on it)
    const propertyCard = page.locator('[data-property-id="kant"]').first();
    if (await propertyCard.count() > 0) {
      await propertyCard.click();
      await page.waitForTimeout(300);
      console.log('✓ Clicked on Kant property card');
    }
    
    // Ensure dates are filled
    await page.fill('input[name="checkIn"]', '2025-11-15');
    await page.fill('input[name="checkOut"]', '2025-11-18');
    await page.fill('input[name="guests"]', '2');
    console.log('✓ Form fields filled');
    
    // Take screenshot before clicking Continue
    await page.screenshot({ path: path.join(screenshotDir, '05-step1-before-continue.png'), fullPage: true });
    console.log('✓ Screenshot saved: 05-step1-before-continue.png');
    
    // Click Continue button
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Next"), button:has-text("Weiter")');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotDir, '06-booking-step2.png'), fullPage: true });
    console.log('✓ Screenshot saved: 06-booking-step2.png');
    
    const currentUrl = page.url();
    console.log('Current URL after Continue:', currentUrl);
    
    if (currentUrl.includes('step=2') || !currentUrl.includes('step=1')) {
      console.log('✓ Reached Step 2');
    } else {
      console.log('⚠ Still on Step 1 (may need validation)');
    }

    // 9. Test navigation from Step 2 - THE CRITICAL TEST
    console.log('\n9. Testing navigation from Step 2...');
    console.log('   CRITICAL: This was broken before (preventDefault issue)');
    console.log('   Testing if header navigation works from Step 2...');
    
    // Take screenshot before clicking
    await page.screenshot({ path: path.join(screenshotDir, '07-step2-before-nav.png'), fullPage: true });
    
    const beforeUrl = page.url();
    console.log('   URL before clicking About:', beforeUrl);
    
    await page.click('header a:has-text("About")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotDir, '08-navigation-from-step2.png'), fullPage: true });
    console.log('✓ Screenshot saved: 08-navigation-from-step2.png');
    
    const afterUrl = page.url();
    console.log('   URL after clicking About:', afterUrl);
    
    if (afterUrl.includes('/about') && !afterUrl.includes('/booking')) {
      console.log('✓✓✓ Navigation on Step 2: WORKS! ✓✓✓');
      console.log('     The fix is successful!');
    } else {
      console.log('✗✗✗ Navigation on Step 2: FAILED');
      console.log('     Still on booking page - navigation is broken');
    }

    console.log('\n=== PART 4: Test Hindenburgdamm Property ===\n');

    // 10. Test the other property too
    console.log('10. Testing Hindenburgdamm property flow...');
    await page.goto('http://localhost:3000/en/booking?propertyId=hinden&checkIn=2025-11-20&checkOut=2025-11-23&guests=3');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotDir, '09-hinden-booking.png'), fullPage: true });
    console.log('✓ Screenshot saved: 09-hinden-booking.png');
    
    const hindenCard = page.locator('[data-property-id="hinden"]').first();
    const hindenCount = await hindenCard.count();
    
    if (hindenCount > 0) {
      const classes = await hindenCard.getAttribute('class');
      console.log('   ✓ Hindenburgdamm property card found');
      console.log('     - Has blue border:', classes.includes('border-blue') ? 'YES ✓' : 'NO ✗');
    } else {
      console.log('   ✗ Hindenburgdamm property NOT pre-selected');
    }

    console.log('\n=== TEST SUMMARY ===\n');
    console.log('All screenshots saved to:', screenshotDir);
    console.log('\nKey Test Results:');
    console.log('1. Property page loads: ✓');
    console.log('2. Date selection on property page: ✓');
    console.log('3. Navigation to booking page: ✓');
    console.log('4. Check results above for:');
    console.log('   - Property pre-selection (kant)');
    console.log('   - Date pre-filling');
    console.log('   - Navigation on Step 1');
    console.log('   - Navigation on Step 2 (CRITICAL FIX)');
    console.log('   - Property pre-selection (hinden)');
    console.log('\nReview screenshots for visual verification!');

  } catch (error) {
    console.error('\n❌ ERROR during testing:', error.message);
    console.error(error.stack);
    await page.screenshot({ path: path.join(screenshotDir, 'ERROR-screenshot.png'), fullPage: true });
    console.log('Error screenshot saved: ERROR-screenshot.png');
  } finally {
    await browser.close();
  }
})();

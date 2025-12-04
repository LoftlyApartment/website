const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const screenshotDir = '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots';
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  console.log('\n=== TESTING BOOKING PAGE FIXES ===\n');

  try {
    // TEST 1: Kant Property Pre-selection
    console.log('TEST 1: Property Pre-selection (Kant)\n');
    
    const bookingUrl = 'http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2';
    await page.goto(bookingUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: path.join(screenshotDir, '01-booking-kant.png'), fullPage: true });
    console.log('Screenshot: 01-booking-kant.png\n');
    
    const kantCard = await page.locator('[data-property-id="kant"]').first();
    const kantExists = await kantCard.count() > 0;
    console.log('Kant property card found:', kantExists);
    
    if (kantExists) {
      const classes = await kantCard.getAttribute('class');
      console.log('Has blue border:', classes.includes('border-blue'));
      console.log('RESULT: Kant property pre-selection - CHECK SCREENSHOT\n');
    }
    
    // TEST 2: Navigation from Step 1
    console.log('TEST 2: Navigation from Step 1\n');
    await page.click('header a:has-text("Properties")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(screenshotDir, '02-nav-step1.png'), fullPage: true });
    
    const navWorked = page.url().includes('/properties');
    console.log('Navigation to Properties worked:', navWorked);
    console.log('RESULT:', navWorked ? 'PASS' : 'FAIL', '\n');
    
    // TEST 3: Navigation from Step 2 (CRITICAL)
    console.log('TEST 3: Navigation from Step 2 (CRITICAL FIX)\n');
    await page.goto(bookingUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    // Move to Step 2
    const propCard = await page.locator('[data-property-id="kant"]').first();
    if (await propCard.count() > 0) await propCard.click();
    
    await page.fill('input[name="checkIn"]', '2025-11-15');
    await page.fill('input[name="checkOut"]', '2025-11-18');
    await page.fill('input[name="guests"]', '2');
    
    await page.locator('button:has-text("Continue"), button:has-text("Weiter")').first().click();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: path.join(screenshotDir, '03-step2.png'), fullPage: true });
    console.log('On Step 2 - Screenshot: 03-step2.png');
    
    console.log('Clicking About link from Step 2...');
    await page.click('header a:has-text("About")');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    await page.screenshot({ path: path.join(screenshotDir, '04-nav-step2.png'), fullPage: true });
    
    const step2NavWorked = page.url().includes('/about');
    console.log('Navigation from Step 2 worked:', step2NavWorked);
    console.log('RESULT:', step2NavWorked ? 'PASS - FIX SUCCESSFUL!' : 'FAIL - FIX DID NOT WORK', '\n');
    
    // TEST 4: Hinden Property Pre-selection
    console.log('TEST 4: Property Pre-selection (Hindenburgdamm)\n');
    const hindenUrl = 'http://localhost:3000/en/booking?propertyId=hinden&checkIn=2025-11-20&checkOut=2025-11-23&guests=3';
    await page.goto(hindenUrl);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: path.join(screenshotDir, '05-booking-hinden.png'), fullPage: true });
    console.log('Screenshot: 05-booking-hinden.png');
    
    const hindenCard = await page.locator('[data-property-id="hinden"]').first();
    const hindenExists = await hindenCard.count() > 0;
    console.log('Hinden property card found:', hindenExists);
    
    if (hindenExists) {
      const classes = await hindenCard.getAttribute('class');
      console.log('Has blue border:', classes.includes('border-blue'));
      console.log('RESULT: Hinden property pre-selection - CHECK SCREENSHOT\n');
    }
    
    console.log('\n=== ALL TESTS COMPLETE ===');
    console.log('Screenshots saved to:', screenshotDir);

  } catch (error) {
    console.error('\nERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotDir, 'ERROR.png'), fullPage: true });
  } finally {
    await browser.close();
  }
})();

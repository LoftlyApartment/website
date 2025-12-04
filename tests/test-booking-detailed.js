const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('=== DETAILED BOOKING FLOW TEST ===\n');
  
  await page.goto('http://localhost:3000/en/properties/kantstrasse');
  await page.waitForLoadState('networkidle');
  
  await page.waitForSelector('#booking-widget', { timeout: 10000 });
  const widget = await page.$('#booking-widget');
  
  if (widget) {
    await widget.screenshot({ path: 'screenshots/widget-01-initial.png' });
    console.log('✓ Widget screenshot 1: Initial state');
  }

  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 3);

  const checkInStr = checkIn.toISOString().split('T')[0];
  const checkOutStr = checkOut.toISOString().split('T')[0];

  console.log('\nSetting dates:');
  console.log('  Check-in:', checkInStr);
  console.log('  Check-out:', checkOutStr);
  console.log('  Expected nights: 3\n');

  const dateInputs = await page.$$('input[type="date"]');
  if (dateInputs.length >= 2) {
    await dateInputs[0].fill(checkInStr);
    await page.waitForTimeout(500);
    await dateInputs[1].fill(checkOutStr);
    await page.waitForTimeout(1500);
  }

  if (widget) {
    await widget.screenshot({ path: 'screenshots/widget-02-dates-filled.png' });
    console.log('✓ Widget screenshot 2: Dates filled');
  }

  const nightsElements = await page.$$('text=/\\d+\\s*(night|Night|Nacht)/');
  console.log('\nNight calculation check:');
  for (let i = 0; i < nightsElements.length; i++) {
    const text = await nightsElements[i].textContent();
    console.log('  Found:', text);
  }

  const priceBreakdown = await page.$$('text=/€\\d+\\s*×\\s*\\d+/');
  console.log('\nPrice breakdown:');
  for (let el of priceBreakdown) {
    const text = await el.textContent();
    console.log('  Found:', text);
  }

  console.log('\n--- Testing Invalid Dates ---\n');
  
  const invalidCheckOut = new Date(checkIn);
  invalidCheckOut.setDate(checkIn.getDate() - 1);
  const invalidCheckOutStr = invalidCheckOut.toISOString().split('T')[0];

  const dateInputs2 = await page.$$('input[type="date"]');
  if (dateInputs2.length >= 2) {
    await dateInputs2[1].fill(invalidCheckOutStr);
    await page.waitForTimeout(1500);
  }

  if (widget) {
    await widget.screenshot({ path: 'screenshots/widget-03-error-state.png' });
    console.log('✓ Widget screenshot 3: Error state');
  }

  const errorElements = await page.$$('.bg-red-50, .text-red-600, [class*="error"]');
  console.log('\nError message check:');
  for (let el of errorElements) {
    const text = await el.textContent();
    if (text && text.trim().length > 0 && text.length < 200) {
      console.log('  Error:', text.trim());
    }
  }

  console.log('\n--- Fixing Dates ---\n');
  
  const dateInputs3 = await page.$$('input[type="date"]');
  if (dateInputs3.length >= 2) {
    await dateInputs3[1].fill(checkOutStr);
    await page.waitForTimeout(1500);
  }

  if (widget) {
    await widget.screenshot({ path: 'screenshots/widget-04-valid-again.png' });
    console.log('✓ Widget screenshot 4: Valid dates restored');
  }

  console.log('\n--- Testing Navigation to Booking Page ---\n');

  const reserveButton = await page.$('button:has-text("Reserve Now"), button:has-text("reserve"), a:has(button:has-text("Reserve"))');
  
  if (reserveButton) {
    const isLink = await reserveButton.evaluate(el => el.tagName === 'A');
    if (isLink) {
      await reserveButton.click();
    } else {
      const parent = await reserveButton.evaluateHandle(el => el.closest('a'));
      if (parent) {
        await parent.asElement().click();
      } else {
        await reserveButton.click();
      }
    }
    
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log('Current URL:', url);
    
    console.log('\nURL Parameter Check:');
    console.log('  Contains "booking":', url.includes('booking') ? '✓' : '✗');
    console.log('  Contains propertyId:', url.includes('propertyId=') ? '✓' : '✗');
    console.log('  Contains checkIn:', url.includes('checkIn=') ? '✓' : '✗');
    console.log('  Contains checkOut:', url.includes('checkOut=') ? '✓' : '✗');
    console.log('  Contains guests:', url.includes('guests=') ? '✓' : '✗');
    
    if (url.includes(checkInStr)) {
      console.log('  ✓ Check-in date matches:', checkInStr);
    } else {
      console.log('  ✗ Check-in date mismatch');
    }
    
    if (url.includes(checkOutStr)) {
      console.log('  ✓ Check-out date matches:', checkOutStr);
    } else {
      console.log('  ✗ Check-out date mismatch');
    }

    await page.screenshot({ path: 'screenshots/booking-page-full.png', fullPage: true });
    console.log('\n✓ Screenshot: Full booking page');

    const formInputs = await page.$$('input[type="date"]');
    console.log('\nBooking form date inputs found:', formInputs.length);
    
    for (let i = 0; i < formInputs.length; i++) {
      const value = await formInputs[i].inputValue();
      console.log('  Input', i + 1, 'value:', value);
    }
  } else {
    console.log('✗ Reserve button not found');
  }

  console.log('\n=== TEST COMPLETE ===');
  await page.waitForTimeout(2000);
  await browser.close();
})();

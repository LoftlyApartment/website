const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  console.log('Part 1: Testing Properties Page...');
  
  await page.goto('http://localhost:3000/en/properties/kantstrasse');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'screenshots/01-property-page-initial.png', fullPage: true });
  console.log('Screenshot 1: Initial property page');

  await page.waitForSelector('input[type="date"]', { timeout: 10000 });
  console.log('Booking widget found');

  const today = new Date();
  const checkIn = new Date(today);
  checkIn.setDate(today.getDate() + 7);
  const checkOut = new Date(checkIn);
  checkOut.setDate(checkIn.getDate() + 3);

  const checkInStr = checkIn.toISOString().split('T')[0];
  const checkOutStr = checkOut.toISOString().split('T')[0];

  console.log('Setting check-in:', checkInStr, 'check-out:', checkOutStr);

  const dateInputs = await page.$$('input[type="date"]');
  console.log('Found', dateInputs.length, 'date inputs');
  
  if (dateInputs.length >= 2) {
    await dateInputs[0].fill(checkInStr);
    await dateInputs[1].fill(checkOutStr);
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/02-dates-filled.png', fullPage: true });
  console.log('Screenshot 2: Dates filled');

  await page.screenshot({ path: 'screenshots/03-nights-calculated.png', fullPage: true });
  console.log('Screenshot 3: Night calculation check');

  console.log('Part 2: Testing Date Validation...');
  
  const invalidCheckOut = new Date(checkIn);
  invalidCheckOut.setDate(checkIn.getDate() - 1);
  const invalidCheckOutStr = invalidCheckOut.toISOString().split('T')[0];

  const dateInputs2 = await page.$$('input[type="date"]');
  if (dateInputs2.length >= 2) {
    await dateInputs2[1].fill(invalidCheckOutStr);
  }

  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/04-invalid-dates.png', fullPage: true });
  console.log('Screenshot 4: Invalid dates');

  const dateInputs3 = await page.$$('input[type="date"]');
  if (dateInputs3.length >= 2) {
    await dateInputs3[1].fill(checkOutStr);
  }
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshots/05-dates-valid-again.png', fullPage: true });
  console.log('Screenshot 5: Dates valid again');

  console.log('Part 3: Testing Data Transfer to Booking Page...');

  const buttons = await page.$$('button');
  console.log('Found', buttons.length, 'buttons');
  
  for (let button of buttons) {
    const text = await button.textContent();
    if (text && (text.includes('Reserve') || text.includes('reserve') || text.includes('Book'))) {
      console.log('Clicking button:', text);
      await button.click();
      break;
    }
  }

  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'screenshots/06-booking-page.png', fullPage: true });
  console.log('Screenshot 6: Booking page loaded');

  const url = page.url();
  console.log('Current URL:', url);

  await page.screenshot({ path: 'screenshots/07-booking-form-prefilled.png', fullPage: true });
  console.log('Screenshot 7: Booking form');

  console.log('Test complete! Check screenshots folder.');
  await page.waitForTimeout(2000);
  await browser.close();
})();

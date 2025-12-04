const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  const testUrl = 'http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2';
  
  console.log('Navigating to booking page with parameters...');
  console.log('URL:', testUrl);
  
  await page.goto(testUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('\nCHECKING BOOKING PAGE\n');
  
  const dateInputs = await page.$$('input[type="date"]');
  console.log('Date inputs found:', dateInputs.length);
  
  for (let i = 0; i < dateInputs.length; i++) {
    const value = await dateInputs[i].inputValue();
    const name = await dateInputs[i].getAttribute('name');
    console.log('  Input', i + 1, 'name:', name, 'value:', value);
  }
  
  console.log('\nCHECKING PAGE CONTENT\n');
  
  const pageText = await page.textContent('body');
  console.log('Check-in date in content:', pageText.includes('2025-11-15') ? 'YES' : 'NO');
  console.log('Check-out date in content:', pageText.includes('2025-11-18') ? 'YES' : 'NO');
  console.log('3 nights in content:', pageText.includes('3 nights') || pageText.includes('3 Nights') ? 'YES' : 'NO');
  
  await page.screenshot({ path: 'screenshots/booking-page-check.png', fullPage: true });
  console.log('\nScreenshot saved');
  
  console.log('\nWaiting 3 seconds for state updates...');
  await page.waitForTimeout(3000);
  
  const dateInputs2 = await page.$$('input[type="date"]');
  console.log('\nAfter wait:');
  for (let i = 0; i < dateInputs2.length; i++) {
    const value = await dateInputs2[i].inputValue();
    console.log('  Input', i + 1, 'value:', value);
  }
  
  await page.screenshot({ path: 'screenshots/booking-page-after-wait.png', fullPage: true });
  
  console.log('\nTEST COMPLETE');
  await browser.close();
})();

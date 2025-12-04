const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  const testUrl = 'http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2';
  
  await page.goto(testUrl);
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const rejectButton = await page.$('button:has-text("Reject")');
  if (rejectButton) {
    await rejectButton.click();
    await page.waitForTimeout(500);
  }
  
  await page.screenshot({ path: 'screenshots/booking-no-cookie.png', fullPage: true });
  console.log('Screenshot without cookie banner');
  
  const dateInputs = await page.$$('input[type="date"]');
  console.log('Date inputs found:', dateInputs.length);
  for (let i = 0; i < dateInputs.length; i++) {
    const value = await dateInputs[i].inputValue();
    console.log('  Input', i + 1, 'value:', value || '(empty)');
  }
  
  const allText = await page.textContent('body');
  console.log('\nDates in page content:');
  console.log('  2025-11-15:', allText.includes('2025-11-15') ? 'YES' : 'NO');
  console.log('  2025-11-18:', allText.includes('2025-11-18') ? 'YES' : 'NO');
  console.log('  3 nights:', allText.includes('3 nights') ? 'YES' : 'NO');
  
  console.log('\nTest complete');
  await browser.close();
})();

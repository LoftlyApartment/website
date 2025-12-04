const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  const screenshotDir = '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots';

  console.log('\n=== MANUAL STEP 2 NAVIGATION TEST ===\n');

  try {
    console.log('1. Going to booking page with parameters...');
    await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('2. On Step 1 - Taking screenshot...');
    await page.screenshot({ path: path.join(screenshotDir, 'step1-ready.png'), fullPage: true });
    console.log('   Screenshot: step1-ready.png\n');
    
    console.log('3. Looking for Continue button...');
    const continueButton = await page.locator('button:has-text("Continue"), button:has-text("Weiter")').first();
    const buttonExists = await continueButton.count() > 0;
    console.log('   Continue button found:', buttonExists);
    
    if (buttonExists) {
      console.log('4. Clicking Continue to go to Step 2...');
      await continueButton.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);
      
      console.log('5. On Step 2 - Taking screenshot...');
      await page.screenshot({ path: path.join(screenshotDir, 'step2-reached.png'), fullPage: true });
      console.log('   Screenshot: step2-reached.png');
      console.log('   URL:', page.url(), '\n');
      
      console.log('6. CRITICAL TEST: Clicking About link from Step 2...');
      console.log('   (This was broken before - preventDefault was blocking navigation)\n');
      
      const beforeUrl = page.url();
      console.log('   URL before clicking:', beforeUrl);
      
      await page.click('header a:has-text("About")');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);
      
      const afterUrl = page.url();
      console.log('   URL after clicking:', afterUrl);
      
      await page.screenshot({ path: path.join(screenshotDir, 'step2-navigation-result.png'), fullPage: true });
      console.log('   Screenshot: step2-navigation-result.png\n');
      
      if (afterUrl.includes('/about') && !afterUrl.includes('/booking')) {
        console.log('✅✅✅ SUCCESS! Navigation from Step 2 WORKS! ✅✅✅');
        console.log('✅✅✅ THE Z-INDEX FIX IS SUCCESSFUL! ✅✅✅\n');
      } else {
        console.log('❌❌❌ FAILED! Still on booking page ❌❌❌');
        console.log('❌ Navigation from Step 2 is still broken\n');
      }
    } else {
      console.log('   ERROR: Could not find Continue button\n');
    }
    
    console.log('7. Testing Hindenburgdamm property pre-selection...');
    await page.goto('http://localhost:3000/en/booking?propertyId=hinden&checkIn=2025-11-20&checkOut=2025-11-23&guests=3');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: path.join(screenshotDir, 'hinden-preselected.png'), fullPage: true });
    console.log('   Screenshot: hinden-preselected.png\n');
    
    console.log('=== TEST COMPLETE ===');
    console.log('Check screenshots in:', screenshotDir);

  } catch (error) {
    console.error('\nERROR:', error.message);
    await page.screenshot({ path: path.join(screenshotDir, 'ERROR-manual.png'), fullPage: true });
  } finally {
    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 10 seconds for inspection...');
    await page.waitForTimeout(10000);
    await browser.close();
  }
})();

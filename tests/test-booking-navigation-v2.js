const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/tmp/booking-nav-screenshots';

async function testBookingNavigation() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const results = {
    step1: { success: false, error: null, navWorks: false },
    step2: { success: false, error: null, navWorks: false },
    step3: { success: false, error: null, navWorks: false }
  };

  try {
    console.log('\n========================================');
    console.log('TESTING STEP 1: Property & Dates');
    console.log('========================================\n');

    await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-step1-initial.png'), fullPage: true });
    console.log('✓ Step 1 loaded');

    // Check current URL
    const step1URL = page.url();
    console.log('Current URL:', step1URL);

    // Try clicking "Properties" link
    const propertiesLink = page.locator('header a:has-text("Properties"), nav a:has-text("Properties")').first();
    if (await propertiesLink.isVisible().catch(() => false)) {
      console.log('✓ Properties link is visible on Step 1');
      await propertiesLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      const afterClickURL = page.url();
      console.log('After click URL:', afterClickURL);
      
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-step1-after-nav.png'), fullPage: true });
      
      if (afterClickURL.includes('/properties')) {
        console.log('✓ Successfully navigated to Properties page!');
        results.step1.navWorks = true;
        results.step1.success = true;
      } else {
        console.log('✗ URL did not change to properties page');
        results.step1.error = 'Navigation did not change URL';
      }
    } else {
      console.log('✗ Properties link not visible');
      results.step1.error = 'Properties link not visible';
    }

    console.log('\n========================================');
    console.log('TESTING STEP 2: Guest Information');
    console.log('========================================\n');

    // Navigate back to booking Step 1
    await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Continue to go to Step 2
    const continueButton = page.locator('button:has-text("Continue")').first();
    if (await continueButton.isVisible().catch(() => false)) {
      await continueButton.click();
      await page.waitForTimeout(2000);
      
      console.log('✓ Navigated to Step 2');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-step2-initial.png'), fullPage: true });
      
      const step2URL = page.url();
      console.log('Step 2 URL:', step2URL);

      // Try clicking "About" link
      const aboutLink = page.locator('header a[href*="about"], nav a[href*="about"]').first();
      if (await aboutLink.isVisible().catch(() => false)) {
        console.log('✓ About link is visible on Step 2');
        
        const beforeURL = page.url();
        await aboutLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        
        const afterURL = page.url();
        console.log('Before click:', beforeURL);
        console.log('After click:', afterURL);
        
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-step2-after-nav.png'), fullPage: true });
        
        if (afterURL.includes('/about') && afterURL !== beforeURL) {
          console.log('✓ Successfully navigated to About page!');
          results.step2.navWorks = true;
          results.step2.success = true;
        } else {
          console.log('✗ Did not navigate to About page');
          results.step2.error = 'Navigation did not change to about page';
        }
      } else {
        console.log('✗ About link not visible');
        results.step2.error = 'About link not visible';
      }
    } else {
      console.log('✗ Continue button not found');
      results.step2.error = 'Continue button not found';
    }

    console.log('\n========================================');
    console.log('TESTING STEP 3: Pricing');
    console.log('========================================\n');

    // Navigate back and complete Step 1 and Step 2
    await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Continue to Step 2
    const continueBtn1 = page.locator('button:has-text("Continue")').first();
    if (await continueBtn1.isVisible().catch(() => false)) {
      await continueBtn1.click();
      await page.waitForTimeout(2000);
      
      console.log('Filling Step 2 form...');
      
      // Fill all required fields with proper waits
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '+49123456789');
      
      // Select dropdowns
      await page.selectOption('select[name="country"]', 'DE');
      await page.selectOption('select[name="purposeOfStay"]', 'business');
      
      // Check required checkboxes
      await page.check('input[name="agreeToTerms"]');
      await page.check('input[name="agreeToPrivacy"]');
      
      await page.waitForTimeout(1500);
      
      // Wait for Continue button to be enabled
      const continueBtn2 = page.locator('button[type="submit"]').first();
      
      // Check if button is enabled
      const isEnabled = await continueBtn2.isEnabled().catch(() => false);
      console.log('Continue button enabled:', isEnabled);
      
      if (isEnabled) {
        await continueBtn2.click();
        await page.waitForTimeout(3000);
        
        console.log('✓ Navigated to Step 3');
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-step3-initial.png'), fullPage: true });
        
        const step3URL = page.url();
        console.log('Step 3 URL:', step3URL);

        // Try clicking "Contact" link
        const contactLink = page.locator('header a[href*="contact"], nav a[href*="contact"]').first();
        if (await contactLink.isVisible().catch(() => false)) {
          console.log('✓ Contact link is visible on Step 3');
          
          const beforeURL = page.url();
          await contactLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          
          const afterURL = page.url();
          console.log('Before click:', beforeURL);
          console.log('After click:', afterURL);
          
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-step3-after-nav.png'), fullPage: true });
          
          if (afterURL.includes('/contact') && afterURL !== beforeURL) {
            console.log('✓ Successfully navigated to Contact page!');
            results.step3.navWorks = true;
            results.step3.success = true;
          } else {
            console.log('✗ Did not navigate to Contact page');
            results.step3.error = 'Navigation did not change to contact page';
          }
        } else {
          console.log('✗ Contact link not visible');
          results.step3.error = 'Contact link not visible';
        }
      } else {
        console.log('✗ Continue button remained disabled - form validation failed');
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'step2-validation-issue.png'), fullPage: true });
        results.step3.error = 'Continue button disabled - form validation issue';
      }
    }

  } catch (error) {
    console.error('\n✗ Error during testing:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }

  console.log('\n========================================');
  console.log('TEST RESULTS SUMMARY');
  console.log('========================================\n');
  
  console.log('Step 1 (Property & Dates):');
  console.log('  - Header navigation:', results.step1.navWorks ? '✓ WORKS' : '✗ FAILED');
  console.log('  - Status:', results.step1.success ? '✓ PASS' : `✗ FAIL - ${results.step1.error}`);
  
  console.log('\nStep 2 (Guest Info):');
  console.log('  - Header navigation:', results.step2.navWorks ? '✓ WORKS' : '✗ FAILED');
  console.log('  - Status:', results.step2.success ? '✓ PASS' : `✗ FAIL - ${results.step2.error}`);
  
  console.log('\nStep 3 (Pricing):');
  console.log('  - Header navigation:', results.step3.navWorks ? '✓ WORKS' : '✗ FAILED');
  console.log('  - Status:', results.step3.success ? '✓ PASS' : `✗ FAIL - ${results.step3.error}`);
  
  console.log(`\nScreenshots saved to: ${SCREENSHOTS_DIR}`);
  
  const allPassed = results.step1.success && results.step2.success && results.step3.success;
  console.log('\n' + (allPassed ? '✓ ALL TESTS PASSED!' : '✗ SOME TESTS FAILED'));
  
  return results;
}

testBookingNavigation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

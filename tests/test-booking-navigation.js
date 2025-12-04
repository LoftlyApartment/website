const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = '/tmp/booking-nav-screenshots';

async function testBookingNavigation() {
  // Create screenshots directory
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const results = {
    step1: { success: false, error: null },
    step2: { success: false, error: null },
    step3: { success: false, error: null },
    step4: { success: false, error: null },
    step5: { success: false, error: null }
  };

  try {
    console.log('\n========================================');
    console.log('TESTING STEP 1: Property & Dates');
    console.log('========================================\n');

    // Navigate to Step 1
    await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take screenshot of Step 1
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-step1-initial.png'), fullPage: true });
    console.log('✓ Screenshot: 01-step1-initial.png');

    // Check if we're on Step 1
    const step1Text = await page.textContent('body');
    console.log('✓ Page loaded, checking for Step 1 indicator');

    // Try clicking "Properties" link in header
    const propertiesLink = page.locator('header a:has-text("Properties"), nav a:has-text("Properties")').first();
    const isVisible = await propertiesLink.isVisible().catch(() => false);
    
    if (isVisible) {
      console.log('✓ Properties link is visible');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-step1-before-click.png'), fullPage: true });
      
      // Click the link
      await propertiesLink.click();
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);
      
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-step1-after-click.png'), fullPage: true });
      console.log('✓ Successfully clicked Properties link');
      console.log('✓ Navigation works on Step 1!');
      results.step1.success = true;
    } else {
      console.log('✗ Properties link not found or not visible');
      results.step1.error = 'Properties link not visible';
    }

    console.log('\n========================================');
    console.log('TESTING STEP 2: Guest Information');
    console.log('========================================\n');

    // Go back to booking
    await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Click Continue to go to Step 2
    const continueButton = page.locator('button:has-text("Continue"), button:has-text("Weiter")').first();
    const continueVisible = await continueButton.isVisible().catch(() => false);
    
    if (continueVisible) {
      await continueButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-step2-initial.png'), fullPage: true });
      console.log('✓ Navigated to Step 2');

      // Try clicking "About" link in header
      const aboutLink = page.locator('header a:has-text("About"), nav a:has-text("About"), header a:has-text("Über"), nav a:has-text("Über")').first();
      const aboutVisible = await aboutLink.isVisible().catch(() => false);
      
      if (aboutVisible) {
        console.log('✓ About link is visible on Step 2');
        await aboutLink.click();
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-step2-after-click.png'), fullPage: true });
        console.log('✓ Successfully clicked About link');
        console.log('✓ Navigation works on Step 2!');
        results.step2.success = true;
      } else {
        console.log('✗ About link not found or not visible on Step 2');
        results.step2.error = 'About link not visible';
      }
    } else {
      console.log('✗ Could not find Continue button on Step 1');
      results.step2.error = 'Continue button not found';
    }

    console.log('\n========================================');
    console.log('TESTING STEP 3: Pricing');
    console.log('========================================\n');

    // Navigate back and fill Step 1 and Step 2 to reach Step 3
    await page.goto('http://localhost:3000/en/booking?propertyId=kant&checkIn=2025-11-15&checkOut=2025-11-18&guests=2');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Continue to Step 2
    const continueBtn1 = page.locator('button:has-text("Continue"), button:has-text("Weiter")').first();
    if (await continueBtn1.isVisible().catch(() => false)) {
      await continueBtn1.click();
      await page.waitForTimeout(2000);
      
      // Fill Step 2 form
      await page.fill('input[name="firstName"]', 'Test');
      await page.fill('input[name="lastName"]', 'User');
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '+49123456789');
      await page.selectOption('select[name="country"]', 'DE');
      await page.selectOption('select[name="purposeOfStay"]', 'leisure');
      await page.check('input[name="agreeToTerms"]');
      await page.check('input[name="agreeToPrivacy"]');
      
      await page.waitForTimeout(1000);
      
      // Continue to Step 3
      const continueBtn2 = page.locator('button[type="submit"]:has-text("Continue"), button[type="submit"]:has-text("Weiter")').first();
      if (await continueBtn2.isVisible().catch(() => false)) {
        await continueBtn2.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '06-step3-initial.png'), fullPage: true });
        console.log('✓ Navigated to Step 3');

        // Try clicking "Contact" link
        const contactLink = page.locator('header a:has-text("Contact"), nav a:has-text("Contact"), header a:has-text("Kontakt"), nav a:has-text("Kontakt")').first();
        const contactVisible = await contactLink.isVisible().catch(() => false);
        
        if (contactVisible) {
          console.log('✓ Contact link is visible on Step 3');
          await contactLink.click();
          await page.waitForLoadState('networkidle');
          await page.waitForTimeout(1000);
          await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '07-step3-after-click.png'), fullPage: true });
          console.log('✓ Successfully clicked Contact link');
          console.log('✓ Navigation works on Step 3!');
          results.step3.success = true;
        } else {
          console.log('✗ Contact link not found or not visible on Step 3');
          results.step3.error = 'Contact link not visible';
        }
      } else {
        console.log('✗ Could not continue from Step 2 to Step 3');
        results.step3.error = 'Could not navigate from Step 2';
      }
    }

    console.log('\n========================================');
    console.log('TESTING STEP 4: Payment');
    console.log('========================================\n');

    // For Step 4, we would need to complete Step 3 which requires payment calculation
    // This is complex, so we'll attempt to navigate directly or note the limitation
    console.log('Note: Step 4 requires completing pricing calculation');
    console.log('Attempting to test if accessible...');
    results.step4.error = 'Step 4 requires full form completion and pricing calculation';

    console.log('\n========================================');
    console.log('TESTING STEP 5: Confirmation');
    console.log('========================================\n');
    
    console.log('Note: Step 5 requires payment completion via Stripe');
    console.log('Cannot test without actual payment flow');
    results.step5.error = 'Step 5 requires Stripe payment completion';

  } catch (error) {
    console.error('\n✗ Error during testing:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png'), fullPage: true });
  } finally {
    await browser.close();
  }

  // Print results summary
  console.log('\n========================================');
  console.log('TEST RESULTS SUMMARY');
  console.log('========================================\n');
  
  console.log('Step 1 (Property & Dates):', results.step1.success ? '✓ PASS' : `✗ FAIL - ${results.step1.error}`);
  console.log('Step 2 (Guest Info):', results.step2.success ? '✓ PASS' : `✗ FAIL - ${results.step2.error}`);
  console.log('Step 3 (Pricing):', results.step3.success ? '✓ PASS' : `✗ FAIL - ${results.step3.error}`);
  console.log('Step 4 (Payment):', results.step4.success ? '✓ PASS' : `✗ FAIL - ${results.step4.error}`);
  console.log('Step 5 (Confirmation):', results.step5.success ? '✓ PASS' : `✗ FAIL - ${results.step5.error}`);
  
  console.log(`\nScreenshots saved to: ${SCREENSHOTS_DIR}`);
  
  return results;
}

testBookingNavigation()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });

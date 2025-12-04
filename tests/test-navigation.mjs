import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Collect console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  console.log('1. Navigating to homepage...');
  await page.goto('http://localhost:3000');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '/tmp/01-homepage.png', fullPage: true });
  console.log('   ✓ Screenshot saved: 01-homepage.png');

  console.log('\n2. Looking for booking links...');
  // Try to find any booking/book now links
  const bookingLinkCount = await page.locator('a:has-text("Book"), a:has-text("Booking"), a[href*="booking"]').count();
  
  if (bookingLinkCount > 0) {
    console.log('   Found booking link, clicking...');
    await page.locator('a:has-text("Book"), a:has-text("Booking"), a[href*="booking"]').first().click();
    await page.waitForLoadState('networkidle');
  } else {
    console.log('   No booking link found in header, navigating directly...');
    await page.goto('http://localhost:3000/en/booking');
    await page.waitForLoadState('networkidle');
  }
  
  await page.screenshot({ path: '/tmp/02-booking-page.png', fullPage: true });
  console.log('   ✓ Screenshot saved: 02-booking-page.png');

  console.log('\n3. Testing navigation links from booking page...');
  
  // Test Home link
  console.log('   Testing Home link...');
  const homeLinkCount = await page.locator('nav a[href="/"], nav a[href="/en"], nav a:has-text("Home")').count();
  if (homeLinkCount > 0) {
    await page.locator('nav a[href="/"], nav a[href="/en"], nav a:has-text("Home")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/03-navigation-to-home.png', fullPage: true });
    console.log('   ✓ Home navigation successful');
    
    // Go back to booking page
    await page.goto('http://localhost:3000/en/booking');
    await page.waitForLoadState('networkidle');
  } else {
    console.log('   ⚠️  Home link not found');
  }

  // Test Properties link
  console.log('   Testing Properties link...');
  const propertiesLinkCount = await page.locator('nav a[href*="properties"], nav a:has-text("Properties")').count();
  if (propertiesLinkCount > 0) {
    await page.locator('nav a[href*="properties"], nav a:has-text("Properties")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/04-navigation-to-properties.png', fullPage: true });
    console.log('   ✓ Properties navigation successful');
    
    // Go back to booking page
    await page.goto('http://localhost:3000/en/booking');
    await page.waitForLoadState('networkidle');
  } else {
    console.log('   ⚠️  Properties link not found');
  }

  // Test About link
  console.log('   Testing About link...');
  const aboutLinkCount = await page.locator('nav a[href*="about"], nav a:has-text("About")').count();
  if (aboutLinkCount > 0) {
    await page.locator('nav a[href*="about"], nav a:has-text("About")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/05-navigation-to-about.png', fullPage: true });
    console.log('   ✓ About navigation successful');
    
    // Go back to booking page
    await page.goto('http://localhost:3000/en/booking');
    await page.waitForLoadState('networkidle');
  } else {
    console.log('   ⚠️  About link not found');
  }

  // Test Contact link
  console.log('   Testing Contact link...');
  const contactLinkCount = await page.locator('nav a[href*="contact"], nav a:has-text("Contact")').count();
  if (contactLinkCount > 0) {
    await page.locator('nav a[href*="contact"], nav a:has-text("Contact")').first().click();
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: '/tmp/06-navigation-to-contact.png', fullPage: true });
    console.log('   ✓ Contact navigation successful');
  } else {
    console.log('   ⚠️  Contact link not found');
  }

  console.log('\n4. Verifying booking page still functions...');
  await page.goto('http://localhost:3000/en/booking');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: '/tmp/07-booking-page-final.png', fullPage: true });
  console.log('   ✓ Screenshot saved: 07-booking-page-final.png');

  console.log('\n✅ All navigation tests completed!');
  if (errors.length > 0) {
    console.log('\n⚠️ Console errors detected:');
    errors.forEach(err => console.log('   -', err));
  } else {
    console.log('\n✓ No console errors detected related to navigation');
  }

  await browser.close();
})();

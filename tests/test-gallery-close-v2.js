const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 500 });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const consoleMessages = [];
  const jsErrors = [];
  
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log('[Browser Console ' + type + ']: ' + text);
    if (type === 'error') {
      consoleMessages.push('Console Error: ' + text);
    }
  });
  
  page.on('pageerror', error => {
    console.log('[JS Error]: ' + error.message);
    jsErrors.push('JS Error: ' + error.message);
  });

  try {
    console.log('\n=== Step 1: Navigate to property page ===');
    await page.goto('http://localhost:3000/en/properties/kantstrasse', { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    await page.waitForTimeout(2000);
    
    console.log('Taking screenshot of property page...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/01-property-page.png',
      fullPage: false 
    });

    // Dismiss cookie banner if present
    const acceptButton = page.locator('button:has-text("Accept All")').first();
    if (await acceptButton.isVisible().catch(() => false)) {
      console.log('Dismissing cookie banner...');
      await acceptButton.click();
      await page.waitForTimeout(500);
    }

    console.log('\n=== Step 2: Click main gallery image to open lightbox ===');
    
    // Click on the main large image area
    const mainImageArea = page.locator('.relative.h-\\[400px\\]').first();
    console.log('Looking for main image area...');
    
    if (await mainImageArea.isVisible().catch(() => false)) {
      console.log('Found main image area, clicking it...');
      await mainImageArea.click();
      await page.waitForTimeout(1500);
    } else {
      console.log('Main image not found, trying alternative selector...');
      // Try clicking any element that opens the gallery
      await page.locator('[class*="cursor-pointer"]').first().click();
      await page.waitForTimeout(1500);
    }
    
    console.log('Taking screenshot of opened lightbox...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/02-lightbox-open.png',
      fullPage: false 
    });

    // Check if lightbox is actually open
    const lightboxDiv = page.locator('.fixed.inset-0.z-50').first();
    const isLightboxVisible = await lightboxDiv.isVisible().catch(() => false);
    console.log('Lightbox visible: ' + isLightboxVisible);

    if (!isLightboxVisible) {
      console.log('ERROR: Lightbox did not open!');
      throw new Error('Lightbox did not open');
    }

    console.log('\n=== Step 3: Inspect close button ===');
    
    // Find the X close button
    const closeButton = page.locator('button[aria-label="Close gallery"]').first();
    const isCloseVisible = await closeButton.isVisible();
    console.log('Close button visible: ' + isCloseVisible);
    
    const closeButtonBox = await closeButton.boundingBox();
    console.log('Close button position:', closeButtonBox);
    
    const closeButtonClasses = await closeButton.getAttribute('class');
    console.log('Close button classes:', closeButtonClasses);

    // Check if button is interactive
    const buttonInfo = await closeButton.evaluateHandle(btn => {
      const rect = btn.getBoundingClientRect();
      const computed = window.getComputedStyle(btn);
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      const topElement = document.elementFromPoint(x, y);
      
      return {
        zIndex: computed.zIndex,
        pointerEvents: computed.pointerEvents,
        opacity: computed.opacity,
        isButtonOnTop: topElement === btn || btn.contains(topElement),
        topElementInfo: topElement ? {
          tag: topElement.tagName,
          className: topElement.className
        } : null
      };
    });
    
    console.log('Button interaction info:', await buttonInfo.jsonValue());

    // Highlight the button visually
    await closeButton.evaluate(btn => {
      btn.style.border = '3px solid red';
    });
    
    console.log('Taking screenshot with highlighted close button...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/03-close-button-highlighted.png',
      fullPage: false 
    });
    
    await page.waitForTimeout(1000);

    console.log('\n=== Step 4: Click the X close button ===');
    console.log('Attempting click on close button...');
    
    try {
      await closeButton.click({ timeout: 5000 });
      console.log('Click executed successfully');
    } catch (error) {
      console.log('Normal click failed: ' + error.message);
      console.log('Trying force click...');
      await closeButton.click({ force: true });
    }
    
    await page.waitForTimeout(1500);
    
    console.log('Taking screenshot after close button click...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/04-after-close-click.png',
      fullPage: false 
    });
    
    const lightboxStillVisible = await lightboxDiv.isVisible().catch(() => false);
    console.log('Lightbox still visible after X button click: ' + lightboxStillVisible);
    
    if (lightboxStillVisible) {
      console.log('\n*** PROBLEM: X button did not close the lightbox! ***\n');
    } else {
      console.log('\n*** SUCCESS: X button closed the lightbox! ***\n');
    }

    console.log('\n=== Step 5: Test background/overlay click ===');
    
    // Reopen lightbox
    console.log('Reopening lightbox...');
    await mainImageArea.click();
    await page.waitForTimeout(1000);
    
    console.log('Clicking on dark background overlay...');
    // Click on the overlay background (top-left corner far from content)
    await page.mouse.click(50, 50);
    await page.waitForTimeout(1500);
    
    console.log('Taking screenshot after background click...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/05-after-background-click.png',
      fullPage: false 
    });
    
    const lightboxAfterBg = await lightboxDiv.isVisible().catch(() => false);
    console.log('Lightbox still visible after background click: ' + lightboxAfterBg);
    
    if (lightboxAfterBg) {
      console.log('*** PROBLEM: Background click did not close the lightbox! ***');
    } else {
      console.log('*** SUCCESS: Background click closed the lightbox! ***');
    }

    console.log('\n=== Step 6: Test ESC key ===');
    
    // Reopen lightbox
    console.log('Reopening lightbox...');
    await mainImageArea.click();
    await page.waitForTimeout(1000);
    
    console.log('Pressing ESC key...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
    
    console.log('Taking screenshot after ESC key...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/06-after-esc-key.png',
      fullPage: false 
    });
    
    const lightboxAfterEsc = await lightboxDiv.isVisible().catch(() => false);
    console.log('Lightbox still visible after ESC key: ' + lightboxAfterEsc);
    
    if (lightboxAfterEsc) {
      console.log('*** PROBLEM: ESC key did not close the lightbox! ***');
    } else {
      console.log('*** SUCCESS: ESC key closed the lightbox! ***');
    }

    console.log('\n=== FINAL SUMMARY ===');
    console.log('Console errors: ' + consoleMessages.length);
    consoleMessages.forEach(msg => console.log('  ' + msg));
    console.log('JS errors: ' + jsErrors.length);
    jsErrors.forEach(err => console.log('  ' + err));
    
    console.log('\nAll screenshots saved to test-screenshots/ directory');
    
  } catch (error) {
    console.error('\n=== FATAL ERROR ===');
    console.error(error);
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/error.png',
      fullPage: true 
    });
  } finally {
    console.log('\nKeeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();

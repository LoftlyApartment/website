const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  const consoleMessages = [];
  const jsErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleMessages.push('Console Error: ' + msg.text());
    }
  });
  
  page.on('pageerror', error => {
    jsErrors.push('JS Error: ' + error.message);
  });

  try {
    console.log('1. Navigating to property page...');
    await page.goto('http://localhost:3000/en/properties/kantstrasse', { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    });
    
    await page.waitForTimeout(3000);
    
    console.log('2. Taking screenshot of property page...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/gallery-property-page.png',
      fullPage: true 
    });

    console.log('3. Looking for gallery elements...');
    
    // Try clicking the "6 photos" button
    const photosButton = page.locator('button:has-text("photos")').first();
    if (await photosButton.isVisible().catch(() => false)) {
      console.log('Found "photos" button, clicking it...');
      await photosButton.click();
    } else {
      // Try clicking on the main image area
      console.log('Looking for main image area...');
      const mainImageArea = page.locator('[class*="gallery"], [class*="image"]').first();
      if (await mainImageArea.isVisible().catch(() => false)) {
        console.log('Found gallery area, clicking it...');
        await mainImageArea.click();
      }
    }
    
    await page.waitForTimeout(1500);
    
    console.log('4. Taking screenshot of opened lightbox...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/gallery-lightbox-open.png',
      fullPage: true 
    });

    console.log('5. Looking for close button...');
    
    // Get all buttons to see what's available
    const allButtons = await page.locator('button').all();
    console.log('Total buttons on page: ' + allButtons.length);
    
    for (let i = 0; i < Math.min(allButtons.length, 20); i++) {
      const btn = allButtons[i];
      const text = await btn.textContent().catch(() => '');
      const ariaLabel = await btn.getAttribute('aria-label').catch(() => '');
      const classes = await btn.getAttribute('class').catch(() => '');
      const isVisible = await btn.isVisible().catch(() => false);
      
      if (isVisible) {
        console.log('Button ' + i + ': text="' + text + '", aria-label="' + ariaLabel + '", class="' + classes + '"');
      }
    }
    
    const closeButtonSelectors = [
      'button:has-text("×")',
      'button:has-text("X")',
      '[aria-label="Close"]',
      '[aria-label="close"]',
      '[aria-label*="Close"]',
      '[data-testid="close-button"]',
      'button[class*="close" i]',
      'button[class*="Close"]',
      '[role="dialog"] button',
      '.modal button'
    ];

    let closeButton = null;
    let foundSelector = '';
    
    for (const selector of closeButtonSelectors) {
      const btns = await page.locator(selector).all();
      for (const btn of btns) {
        if (await btn.isVisible().catch(() => false)) {
          closeButton = btn;
          foundSelector = selector;
          console.log('\nFound close button with selector: ' + selector);
          break;
        }
      }
      if (closeButton) break;
    }

    if (closeButton) {
      const buttonBox = await closeButton.boundingBox();
      console.log('Close button position:', buttonBox);
      
      const isEnabled = await closeButton.isEnabled();
      console.log('Close button enabled: ' + isEnabled);
      
      const buttonText = await closeButton.textContent().catch(() => '');
      console.log('Close button text: "' + buttonText + '"');
      
      const buttonClasses = await closeButton.getAttribute('class').catch(() => '');
      console.log('Close button classes: ' + buttonClasses);

      // Check z-index and visibility
      const buttonElement = await closeButton.elementHandle();
      const styleInfo = await page.evaluate((btn) => {
        const computed = window.getComputedStyle(btn);
        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        const topElement = document.elementFromPoint(x, y);
        
        return {
          zIndex: computed.zIndex,
          position: computed.position,
          opacity: computed.opacity,
          display: computed.display,
          pointerEvents: computed.pointerEvents,
          isButtonOnTop: topElement === btn || btn.contains(topElement),
          topElementInfo: topElement ? {
            tag: topElement.tagName,
            class: topElement.className,
            id: topElement.id
          } : null
        };
      }, buttonElement);
      
      console.log('Button style info:', styleInfo);

      console.log('\n6. Attempting to click close button...');
      
      try {
        await closeButton.click({ timeout: 5000, force: false });
        console.log('Click executed successfully');
      } catch (clickError) {
        console.log('Click failed: ' + clickError.message);
        console.log('Trying force click...');
        await closeButton.click({ force: true });
      }
      
      await page.waitForTimeout(1500);
      
      console.log('7. Taking screenshot after close button click...');
      await page.screenshot({ 
        path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/gallery-after-close-click.png',
        fullPage: true 
      });
      
      // Check if modal/dialog is still present
      const dialogStillPresent = await page.locator('[role="dialog"]').isVisible().catch(() => false);
      console.log('Dialog still visible after close click: ' + dialogStillPresent);
      
    } else {
      console.log('\n*** NO CLOSE BUTTON FOUND! ***');
    }

    // Test clicking background/overlay
    console.log('\n8. Testing click on dark background/overlay...');
    const overlay = page.locator('[role="dialog"]').first();
    if (await overlay.isVisible().catch(() => false)) {
      // Click in the corner to hit the overlay not the content
      const overlayBox = await overlay.boundingBox();
      if (overlayBox) {
        await page.mouse.click(overlayBox.x + 10, overlayBox.y + 10);
        await page.waitForTimeout(1500);
        
        console.log('9. Taking screenshot after background click...');
        await page.screenshot({ 
          path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/gallery-after-background-click.png',
          fullPage: true 
        });
        
        const dialogAfterBgClick = await page.locator('[role="dialog"]').isVisible().catch(() => false);
        console.log('Dialog still visible after background click: ' + dialogAfterBgClick);
      }
    }

    // Reopen for ESC test
    console.log('\n10. Reopening gallery for ESC key test...');
    await page.goto('http://localhost:3000/en/properties/kantstrasse');
    await page.waitForTimeout(2000);
    
    const photosBtn = page.locator('button:has-text("photos")').first();
    if (await photosBtn.isVisible().catch(() => false)) {
      await photosBtn.click();
      await page.waitForTimeout(1000);
    }
    
    console.log('11. Testing ESC key...');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1500);
    
    console.log('12. Taking screenshot after ESC key...');
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/gallery-after-esc.png',
      fullPage: true 
    });
    
    const dialogAfterEsc = await page.locator('[role="dialog"]').isVisible().catch(() => false);
    console.log('Dialog still visible after ESC: ' + dialogAfterEsc);

    console.log('\n=== CONSOLE MESSAGES ===');
    consoleMessages.forEach(msg => console.log(msg));
    
    console.log('\n=== JS ERRORS ===');
    jsErrors.forEach(err => console.log(err));
    
    console.log('\n=== SUMMARY ===');
    console.log('Screenshots saved to test-screenshots/ directory');
    console.log('Check screenshots to see visual state at each step');
    
  } catch (error) {
    console.error('\n=== ERROR DURING TEST ===');
    console.error(error);
    await page.screenshot({ 
      path: '/Users/philippbernert/Desktop/LoftyV4/Website/test-screenshots/gallery-error.png',
      fullPage: true 
    });
  } finally {
    console.log('\nKeeping browser open for 5 seconds...');
    await page.waitForTimeout(5000);
    await browser.close();
  }
})();

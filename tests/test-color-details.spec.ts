import { test, expect } from '@playwright/test';

test.describe('Luxury Color Details Testing', () => {
  test('Homepage - Header and CTA buttons', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of header
    const header = page.locator('header');
    await header.screenshot({ 
      path: 'test-screenshots/header-colors.png'
    });
    
    // Screenshot of primary CTA
    const cta = page.locator('text=Book Now').first();
    await cta.screenshot({ 
      path: 'test-screenshots/cta-button-colors.png'
    });
    
    console.log('✓ Header and CTA screenshots captured');
  });

  test('Properties - Card borders and buttons', async ({ page }) => {
    await page.goto('http://localhost:3000/en/properties');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of first property card
    const propertyCard = page.locator('[class*="property"]').first();
    await propertyCard.screenshot({ 
      path: 'test-screenshots/property-card-colors.png'
    });
    
    console.log('✓ Property card screenshot captured');
  });

  test('Property Detail - Booking widget colors', async ({ page }) => {
    await page.goto('http://localhost:3000/en/properties/kantstrasse');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of booking widget
    const bookingWidget = page.locator('form').first();
    await bookingWidget.screenshot({ 
      path: 'test-screenshots/booking-widget-colors.png'
    });
    
    console.log('✓ Booking widget screenshot captured');
  });

  test('Footer - Dark charcoal with cream text', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Screenshot of footer
    const footer = page.locator('footer');
    await footer.screenshot({ 
      path: 'test-screenshots/footer-colors.png'
    });
    
    console.log('✓ Footer screenshot captured');
  });
});

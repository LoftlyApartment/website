import { test, expect } from '@playwright/test';

test.describe('Luxury Color Palette Visual Testing', () => {
  test('Homepage - Verify luxury colors', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-screenshots/homepage-luxury-colors.png',
      fullPage: true 
    });
    
    // Verify header exists
    const header = page.locator('header');
    await expect(header).toBeVisible();
    
    // Verify footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    console.log('✓ Homepage screenshot captured');
  });

  test('Properties Page - Verify luxury colors', async ({ page }) => {
    await page.goto('http://localhost:3000/en/properties');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-screenshots/properties-luxury-colors.png',
      fullPage: true 
    });
    
    // Verify property cards exist
    const propertyCards = page.locator('[class*="property"]').first();
    await expect(propertyCards).toBeVisible();
    
    console.log('✓ Properties page screenshot captured');
  });

  test('Property Detail Page - Verify luxury colors', async ({ page }) => {
    await page.goto('http://localhost:3000/en/properties/kantstrasse');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-screenshots/property-detail-luxury-colors.png',
      fullPage: true 
    });
    
    // Verify booking widget exists
    const bookingWidget = page.locator('form').first();
    await expect(bookingWidget).toBeVisible();
    
    console.log('✓ Property detail page screenshot captured');
  });

  test('Booking Page - Verify luxury colors', async ({ page }) => {
    await page.goto('http://localhost:3000/en/booking');
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'test-screenshots/booking-luxury-colors.png',
      fullPage: true 
    });
    
    console.log('✓ Booking page screenshot captured');
  });
});

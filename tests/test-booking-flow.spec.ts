import { test, expect } from '@playwright/test';

test.describe('Booking Flow with Date Calculation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage
    await page.goto('http://localhost:3000');
  });

  test('Part 1: Properties page date selection and night calculation', async ({ page }) => {
    // Navigate to Properties page
    await page.click('text=Properties, text=Unterkunfte, text=Unterkünfte').catch(() => {
      // Try alternative selectors
      page.goto('http://localhost:3000/en/properties');
    });

    await page.waitForLoadState('networkidle');
    
    // Take screenshot of initial state
    await page.screenshot({ path: 'screenshots/01-properties-initial.png', fullPage: true });

    // Find a booking widget
    const bookingWidget = await page.locator('[data-testid="booking-widget"], .booking-widget, form').first();
    
    // Take screenshot of booking widget
    await bookingWidget.screenshot({ path: 'screenshots/02-booking-widget-initial.png' });

    // Find check-in and check-out date inputs
    const checkInInput = await page.locator('input[name="checkIn"], input[type="date"]').first();
    const checkOutInput = await page.locator('input[name="checkOut"], input[type="date"]').nth(1);

    // Set future dates
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 7);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 3);

    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    await checkInInput.fill(checkInStr);
    await checkOutInput.fill(checkOutStr);

    // Wait for calculation
    await page.waitForTimeout(1000);

    // Take screenshot showing calculated nights
    await page.screenshot({ path: 'screenshots/03-nights-calculated.png', fullPage: true });

    // Verify nights calculation appears
    const nightsText = await page.locator('text=/\\d+\\s*(night|Night|Nacht|Nächte)/').first();
    await expect(nightsText).toBeVisible();
    
    await nightsText.screenshot({ path: 'screenshots/04-nights-display.png' });
  });

  test('Part 2: Date validation', async ({ page }) => {
    await page.goto('http://localhost:3000/en/properties');
    await page.waitForLoadState('networkidle');

    const checkInInput = await page.locator('input[name="checkIn"], input[type="date"]').first();
    const checkOutInput = await page.locator('input[name="checkOut"], input[type="date"]').nth(1);

    // Set invalid dates (check-out before check-in)
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 7);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() - 1); // One day BEFORE check-in

    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    await checkInInput.fill(checkInStr);
    await checkOutInput.fill(checkOutStr);

    await page.waitForTimeout(1000);

    // Take screenshot of error message
    await page.screenshot({ path: 'screenshots/05-date-validation-error.png', fullPage: true });

    // Verify error message appears
    const errorMessage = await page.locator('text=/error|invalid|must be after|nach/i').first();
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Fix the dates
    const validCheckOutDate = new Date(checkInDate);
    validCheckOutDate.setDate(checkInDate.getDate() + 2);
    const validCheckOutStr = validCheckOutDate.toISOString().split('T')[0];

    await checkOutInput.fill(validCheckOutStr);
    await page.waitForTimeout(1000);

    // Take screenshot showing error disappeared
    await page.screenshot({ path: 'screenshots/06-dates-valid-again.png', fullPage: true });
  });

  test('Part 3: Data transfer to booking page', async ({ page }) => {
    await page.goto('http://localhost:3000/en/properties');
    await page.waitForLoadState('networkidle');

    const checkInInput = await page.locator('input[name="checkIn"], input[type="date"]').first();
    const checkOutInput = await page.locator('input[name="checkOut"], input[type="date"]').nth(1);

    // Set valid dates
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 7);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 3);

    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    await checkInInput.fill(checkInStr);
    await checkOutInput.fill(checkOutStr);
    await page.waitForTimeout(1000);

    // Click Reserve Now button
    const reserveButton = await page.locator('button:has-text("Reserve Now"), button:has-text("Book Now"), button:has-text("Reservieren")').first();
    
    await reserveButton.screenshot({ path: 'screenshots/07-reserve-button.png' });
    
    // Verify button is enabled
    await expect(reserveButton).toBeEnabled();

    await reserveButton.click();
    await page.waitForLoadState('networkidle');

    // Take screenshot of booking page
    await page.screenshot({ path: 'screenshots/08-booking-page.png', fullPage: true });

    // Verify URL contains booking
    expect(page.url()).toContain('booking');

    // Verify dates are in URL or form
    const pageContent = await page.content();
    expect(pageContent).toContain(checkInStr);
    expect(pageContent).toContain(checkOutStr);

    // Take screenshot of pre-filled form
    await page.screenshot({ path: 'screenshots/09-prefilled-booking-form.png', fullPage: true });
  });

  test('Part 4: Complete booking flow', async ({ page }) => {
    await page.goto('http://localhost:3000/en/properties');
    await page.waitForLoadState('networkidle');

    const checkInInput = await page.locator('input[name="checkIn"], input[type="date"]').first();
    const checkOutInput = await page.locator('input[name="checkOut"], input[type="date"]').nth(1);

    // Set valid dates
    const today = new Date();
    const checkInDate = new Date(today);
    checkInDate.setDate(today.getDate() + 7);
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkInDate.getDate() + 3);

    const checkInStr = checkInDate.toISOString().split('T')[0];
    const checkOutStr = checkOutDate.toISOString().split('T')[0];

    await checkInInput.fill(checkInStr);
    await checkOutInput.fill(checkOutStr);
    await page.waitForTimeout(1000);

    // Click Reserve Now
    const reserveButton = await page.locator('button:has-text("Reserve Now"), button:has-text("Book Now"), button:has-text("Reservieren")').first();
    await reserveButton.click();
    await page.waitForLoadState('networkidle');

    // Take screenshots of each step in the booking process
    await page.screenshot({ path: 'screenshots/10-booking-step-1.png', fullPage: true });

    // Check for console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Wait a bit to capture any console errors
    await page.waitForTimeout(2000);

    if (errors.length > 0) {
      console.log('Console errors detected:', errors);
    }
  });
});

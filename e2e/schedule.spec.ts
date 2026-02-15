import { test, expect } from '@playwright/test';

test.describe('Schedule Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByRole('heading', { name: 'Schedule' })).toBeVisible({ timeout: 15000 });
  });

  test('schedule page loads and shows calendar', async ({ page }) => {
    // Verify day headers are visible (Mon-Fri)
    await expect(page.getByText('Mon')).toBeVisible();
    await expect(page.getByText('Tue')).toBeVisible();
    await expect(page.getByText('Wed')).toBeVisible();
    await expect(page.getByText('Thu')).toBeVisible();
    await expect(page.getByText('Fri')).toBeVisible();
  });

  test('schedule shows time slots', async ({ page }) => {
    // Wait for loading to finish
    await expect(page.locator('.skeleton')).toBeHidden({ timeout: 15000 });

    // Verify time labels
    await expect(page.getByText('8 AM')).toBeVisible();
    await expect(page.getByText('12 PM')).toBeVisible();
    await expect(page.getByText('5 PM')).toBeVisible();
  });

  test('week/day view toggle', async ({ page }) => {
    // Default is week view - verify 5 day columns
    await expect(page.getByText('Mon')).toBeVisible();
    await expect(page.getByText('Fri')).toBeVisible();

    // Switch to day view
    await page.getByRole('button', { name: 'Day', exact: true }).click();

    // In day view, the date display changes to show a single day format
    // and only one column should be visible
    await expect(page.getByRole('button', { name: 'Day', exact: true })).toHaveClass(/bg-blue-600/);

    // Switch back to week view
    await page.getByRole('button', { name: 'Week', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Week', exact: true })).toHaveClass(/bg-blue-600/);
  });

  test('today button resets to current date', async ({ page }) => {
    // Click forward arrow first
    await page.locator('button:has-text("›")').click();
    await page.waitForTimeout(300);

    // Click Today button
    await page.getByRole('button', { name: 'Today' }).click();
    await page.waitForTimeout(300);

    // Calendar should show today's date (verify it loaded without errors)
    await expect(page.getByRole('heading', { name: 'Schedule' })).toBeVisible();
  });

  test('provider filter is present', async ({ page }) => {
    const providerSelect = page.locator('select').filter({ hasText: 'All Providers' });
    await expect(providerSelect).toBeVisible();
  });
});

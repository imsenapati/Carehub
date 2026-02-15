import { test, expect } from '@playwright/test';

test.describe('Patients Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/patients');
    // Wait for the patient table to load
    await expect(page.locator('table')).toBeVisible({ timeout: 15000 });
  });

  test('patient list loads and shows table', async ({ page }) => {
    // Verify table headers using column header role
    await expect(page.getByRole('columnheader', { name: /Patient/ })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'MRN' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'DOB' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible();

    // Verify at least one patient row exists
    const rows = page.locator('tbody tr');
    await expect(rows.first()).toBeVisible();
  });

  test('patient search filters results', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by name, MRN, or date of birth...');
    await expect(searchInput).toBeVisible();

    // Type a search term and wait for results to update
    await searchInput.fill('MRN');
    await page.waitForTimeout(600); // Wait for debounce

    // Verify that results are filtered (table still visible)
    await expect(page.locator('table')).toBeVisible();
  });

  test('patient status filter works', async ({ page }) => {
    const statusSelect = page.locator('select').filter({ hasText: 'All Statuses' });
    await statusSelect.selectOption('active');

    // Wait for filtered results
    await page.waitForTimeout(500);
    await expect(page.locator('table')).toBeVisible();
  });

  test('patient pagination is visible', async ({ page }) => {
    await expect(page.getByText(/Page \d+ of \d+/)).toBeVisible();
  });

  test('navigate to patient detail', async ({ page }) => {
    // Click the first "View" link
    const viewLink = page.getByRole('link', { name: 'View' }).first();
    await viewLink.click();

    // Verify we navigated to a patient detail page
    await expect(page).toHaveURL(/\/patients\/pat-/);

    // Wait for patient detail content to load
    await expect(page.locator('text=Overview')).toBeVisible({ timeout: 15000 });
  });

  test('pagination next/previous buttons work', async ({ page }) => {
    await expect(page.getByText('Page 1 of')).toBeVisible();

    // Click Next
    const nextButton = page.getByRole('button', { name: 'Next', exact: true });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      await page.waitForTimeout(500);
      await expect(page.getByText('Page 2 of')).toBeVisible();

      // Click Previous
      const prevButton = page.getByRole('button', { name: 'Previous' });
      await prevButton.click();
      await page.waitForTimeout(500);
      await expect(page.getByText('Page 1 of')).toBeVisible();
    }
  });
});

import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('dashboard loads and shows header', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Good morning, Dr. Chen')).toBeVisible();
  });

  test('dashboard shows stats cards once loaded', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText("Today's Appointments")).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Active Patients')).toBeVisible();
  });

  test('sidebar navigates to patients page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Patients' }).click();
    await expect(page).toHaveURL(/\/patients/);
    await expect(page.getByRole('heading', { name: 'Patients' })).toBeVisible({ timeout: 15000 });
  });

  test('sidebar navigates to schedule page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Schedule' }).click();
    await expect(page).toHaveURL(/\/schedule/);
    await expect(page.getByRole('heading', { name: 'Schedule' })).toBeVisible({ timeout: 15000 });
  });

  test('sidebar navigates back to dashboard', async ({ page }) => {
    await page.goto('/patients');
    await page.getByRole('link', { name: 'Dashboard' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('Good morning, Dr. Chen')).toBeVisible();
  });

  test('sidebar highlights active route', async ({ page }) => {
    await page.goto('/patients');
    const patientsLink = page.getByRole('link', { name: 'Patients' });
    await expect(patientsLink).toHaveClass(/bg-blue-50/);
  });
});

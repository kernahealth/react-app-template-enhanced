import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
  await expect(page.locator('h1')).toContainText('My Awesome React App');
  await expect(page.getByText('Hello World with Vite + TypeScript!')).toBeVisible();
});

test('counter increments', async ({ page }) => {
  await page.goto('/');

  const button = page.getByRole('button', { name: /count is 0/i });
  await expect(button).toBeVisible();

  await button.click();
  await expect(page.getByRole('button', { name: /count is 1/i })).toBeVisible();
});

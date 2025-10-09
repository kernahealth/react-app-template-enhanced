import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('loads correctly with all elements', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Vite \+ React \+ TS/);
    await expect(page.locator('h1')).toContainText('My Awesome React App');
    await expect(
      page.getByText('Hello World with Vite + TypeScript!')
    ).toBeVisible();
  });

  test('counter increments correctly', async ({ page }) => {
    await page.goto('/');

    // Find the increment button
    const incrementButton = page.getByRole('button', { name: '+' });
    await expect(incrementButton).toBeVisible();

    // Check initial count
    await expect(page.getByText('Count is 0')).toBeVisible();

    // Click increment
    await incrementButton.click();
    await expect(page.getByText('Count is 1')).toBeVisible();

    // Click multiple times
    await incrementButton.click();
    await incrementButton.click();
    await expect(page.getByText('Count is 3')).toBeVisible();
  });

  test('counter decrements correctly', async ({ page }) => {
    await page.goto('/');

    // Increment first
    const incrementButton = page.getByRole('button', { name: '+' });
    await incrementButton.click();
    await incrementButton.click();
    await incrementButton.click();
    await expect(page.getByText('Count is 3')).toBeVisible();

    // Now decrement
    const decrementButton = page.getByRole('button', { name: '-' });
    await decrementButton.click();
    await expect(page.getByText('Count is 2')).toBeVisible();
  });

  test('counter resets correctly', async ({ page }) => {
    await page.goto('/');

    // Increment
    const incrementButton = page.getByRole('button', { name: '+' });
    await incrementButton.click();
    await incrementButton.click();
    await expect(page.getByText('Count is 2')).toBeVisible();

    // Reset
    const resetButton = page.getByRole('button', { name: 'Reset Counter' });
    await resetButton.click();
    await expect(page.getByText('Count is 0')).toBeVisible();
  });

  test('counter persists across page reloads', async ({ page }) => {
    await page.goto('/');

    // Increment counter
    const incrementButton = page.getByRole('button', { name: '+' });
    await incrementButton.click();
    await incrementButton.click();
    await incrementButton.click();
    await expect(page.getByText('Count is 3')).toBeVisible();

    // Reload page
    await page.reload();

    // Check that count persisted
    await expect(page.getByText('Count is 3')).toBeVisible();
  });

  test('displays features list', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByText('Features Ready:')).toBeVisible();
    await expect(page.getByText('TypeScript support')).toBeVisible();
    await expect(page.getByText('React Router DOM')).toBeVisible();
    await expect(page.getByText('Zustand state management')).toBeVisible();
  });
});

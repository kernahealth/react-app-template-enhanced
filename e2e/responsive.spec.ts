import { test, expect } from '@playwright/test';

test.describe('Responsive Design', () => {
  test('renders correctly on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    await expect(page.getByText('My Awesome React App')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
  });

  test('renders correctly on tablet viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByText('My Awesome React App')).toBeVisible();
    await expect(page.getByText('React Template')).toBeVisible();
  });

  test('renders correctly on desktop viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/');

    await expect(page.getByText('My Awesome React App')).toBeVisible();
    const navbar = page.locator('nav');
    await expect(navbar).toBeVisible();
  });

  test('users page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/users');

    await expect(page.getByText('Users Management')).toBeVisible();
    await page.waitForSelector('table');
    const table = page.locator('table');
    await expect(table).toBeVisible();
  });

  test('about page is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
    await expect(page.getByText('Enhanced Features:')).toBeVisible();
  });

  test('navigation works on different viewports', async ({ page }) => {
    // Test on small mobile
    await page.setViewportSize({ width: 320, height: 568 });
    await page.goto('/');

    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');

    // Test on large desktop
    await page.setViewportSize({ width: 2560, height: 1440 });
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
  });
});

import { test, expect } from '@playwright/test';

test.describe('NotFound Page', () => {
  test('displays 404 error for non-existent routes', async ({ page }) => {
    await page.goto('/this-page-does-not-exist');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page not found')).toBeVisible();
  });

  test('displays helpful message to user', async ({ page }) => {
    await page.goto('/invalid-route-xyz');

    await expect(
      page.getByText('Use the navigation bar above to go back to the app')
    ).toBeVisible();
  });

  test('navbar is accessible on 404 page', async ({ page }) => {
    await page.goto('/does-not-exist');

    await expect(page.getByText('React Template')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
  });

  test('can navigate from 404 to valid pages', async ({ page }) => {
    await page.goto('/bad-route');

    await expect(page.getByText('404')).toBeVisible();

    // Navigate to each page
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');

    await page.goto('/another-bad-route');
    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');

    await page.goto('/yet-another-bad-route');
    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page).toHaveURL('/users');
  });

  test('maintains proper layout on 404 page', async ({ page }) => {
    await page.goto('/missing-page');

    // Check that the layout is consistent
    const header = page.locator('header');
    await expect(header).toBeVisible();

    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toContainText('404');
  });
});

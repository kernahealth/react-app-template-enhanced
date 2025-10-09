import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navbar is present on all pages', async ({ page }) => {
    await page.goto('/');

    // Check navbar elements
    await expect(page.getByText('React Template')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Users' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Contact' })).toBeVisible();
  });

  test('navigates to About page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL('/about');
    await expect(page.getByText('Enhanced Features:')).toBeVisible();
    await expect(
      page.getByText('TanStack Query for server state management')
    ).toBeVisible();
  });

  test('navigates to Users page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Users' }).click();
    await expect(page).toHaveURL('/users');
    await expect(page.getByText('👥 Users Management')).toBeVisible();
  });

  test('navigates to Contact page', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL('/contact');
    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
  });

  test('navigates back to Home from About', async ({ page }) => {
    await page.goto('/about');

    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText('My Awesome React App')).toBeVisible();
  });

  test('navbar highlights active route', async ({ page }) => {
    await page.goto('/');

    const homeLink = page.getByRole('link', { name: 'Home' });
    await expect(homeLink).toHaveCSS('color', 'rgb(100, 108, 255)');

    // Navigate to About
    await page.getByRole('link', { name: 'About' }).click();
    const aboutLink = page.getByRole('link', { name: 'About' });
    await expect(aboutLink).toHaveCSS('color', 'rgb(100, 108, 255)');
  });

  test('handles 404 page', async ({ page }) => {
    await page.goto('/non-existent-route');

    await expect(page.getByText('404')).toBeVisible();
    await expect(page.getByText('Page Not Found')).toBeVisible();
  });

  test('navbar remains functional on 404 page', async ({ page }) => {
    await page.goto('/non-existent-route');

    // Navbar should still work
    await expect(page.getByText('React Template')).toBeVisible();
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL('/');
  });
});

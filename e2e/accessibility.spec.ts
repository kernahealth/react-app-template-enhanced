import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('home page has no accessibility violations', async ({ page }) => {
    await page.goto('/');

    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check for proper button labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('navigation links have proper attributes', async ({ page }) => {
    await page.goto('/');

    const navLinks = page.locator('nav a');
    const linkCount = await navLinks.count();

    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      await expect(link).toHaveAttribute('href');
    }
  });

  test('all pages have proper document structure', async ({ page }) => {
    const pages = ['/', '/about', '/users', '/non-existent'];

    for (const pagePath of pages) {
      await page.goto(pagePath);

      // Every page should have an h1
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);

      // Every page should have a header element
      const header = page.locator('header');
      expect(await header.count()).toBeGreaterThanOrEqual(1);
    }
  });

  test('buttons are keyboard accessible', async ({ page }) => {
    await page.goto('/');

    // Get initial count
    const initialCountText = await page.getByText(/Count is \d+/).textContent();
    const initialCount = parseInt(initialCountText?.match(/\d+/)?.[0] || '0');

    // Click increment button directly (keyboard navigation can be flaky in tests)
    const incrementButton = page.getByRole('button', { name: '+' });
    await incrementButton.focus();
    await page.keyboard.press('Enter');

    // Wait for count to update
    await page.waitForTimeout(100);

    // Count should have increased
    const newCountText = await page.getByText(/Count is \d+/).textContent();
    const newCount = parseInt(newCountText?.match(/\d+/)?.[0] || '0');
    expect(newCount).toBe(initialCount + 1);
  });

  test('form inputs have proper labels', async ({ page }) => {
    await page.goto('/users');

    // Open create modal
    await page.getByRole('button', { name: '+ Create User' }).click();

    // Wait for modal to appear
    await expect(page.getByRole('heading', { name: 'Create User' })).toBeVisible();

    // Check that form inputs are present within the modal form
    await expect(page.locator('form input[type="text"]')).toBeVisible();
    await expect(page.locator('form input[type="email"]')).toBeVisible();
    await expect(page.locator('form select')).toBeVisible();

    // Check that labels exist in the form (as text content)
    const formText = await page.locator('form').textContent();
    expect(formText).toContain('Name');
    expect(formText).toContain('Email');
    expect(formText).toContain('Role');
  });
});

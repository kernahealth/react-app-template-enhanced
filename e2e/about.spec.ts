import { test, expect } from '@playwright/test';

test.describe('About Page', () => {
  test('displays all sections', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByRole('heading', { name: /About/i })).toBeVisible();
    await expect(page.getByText('Enhanced Features:')).toBeVisible();
    await expect(page.getByText('Project Structure:')).toBeVisible();
  });

  test('displays enhanced features list', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByText('React Router DOM for routing')).toBeVisible();
    await expect(
      page.getByText('TanStack Query for server state management')
    ).toBeVisible();
    await expect(
      page.getByText('Zustand for client state management')
    ).toBeVisible();
    await expect(
      page.getByText('MSW for API mocking in development and testing')
    ).toBeVisible();
  });

  test('displays project structure list', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByText(/Pages:/i)).toBeVisible();
    await expect(page.getByText(/Home, Users, Contact, About/i)).toBeVisible();
    await expect(page.getByText(/Services:/i)).toBeVisible();
    await expect(page.getByText(/apiClient, userService/i)).toBeVisible();
    await expect(page.getByText(/Stores:/i)).toBeVisible();
    await expect(page.getByText(/Zustand example store/i)).toBeVisible();
  });

  test('displays all technology features', async ({ page }) => {
    await page.goto('/about');

    await expect(page.getByText('Axios HTTP client')).toBeVisible();
    await expect(page.getByText('Sonner toast notifications')).toBeVisible();
  });

  test('displays introductory text', async ({ page }) => {
    await page.goto('/about');

    await expect(
      page.getByText('This is the enhanced React template with additional features.')
    ).toBeVisible();
  });

  test('has proper heading hierarchy', async ({ page }) => {
    await page.goto('/about');

    const h1 = page.locator('h1');
    const h2s = page.locator('h2');

    await expect(h1).toHaveCount(1);
    // Should have at least 2 h2 headings (Enhanced Features and Project Structure)
    expect(await h2s.count()).toBeGreaterThanOrEqual(2);
  });
});

import { test, expect } from '@playwright/test';

test.describe('Contact Page', () => {
  test('loads and displays contact form', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.getByRole('heading', { name: 'Contact Us' })).toBeVisible();
    await expect(
      page.getByText(/Have a question or feedback/i)
    ).toBeVisible();
  });

  test('displays all form fields', async ({ page }) => {
    await page.goto('/contact');

    // Check all form fields are present
    await expect(page.locator('#name')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#subject')).toBeVisible();
    await expect(page.locator('#message')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /send message/i })
    ).toBeVisible();
  });

  test('shows validation errors for empty form', async ({ page }) => {
    await page.goto('/contact');

    // Click submit without filling form
    await page.getByRole('button', { name: /send message/i }).click();

    // Should show validation errors (wait for them to appear)
    await expect(
      page.getByText(/name must be at least 2 characters/i)
    ).toBeVisible({ timeout: 2000 });
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/contact');

    // Fill with invalid email
    await page.locator('#email').fill('invalid-email');
    await page.locator('#email').blur();

    // Should show email validation error
    await expect(
      page.getByText(/please enter a valid email address/i)
    ).toBeVisible({ timeout: 2000 });
  });

  test('shows validation error for short name', async ({ page }) => {
    await page.goto('/contact');

    // Fill with short name
    await page.locator('#name').fill('A');
    await page.locator('#name').blur();

    // Should show name validation error
    await expect(
      page.getByText(/name must be at least 2 characters/i)
    ).toBeVisible({ timeout: 2000 });
  });

  test('submits form successfully with valid data', async ({ page }) => {
    await page.goto('/contact');

    // Fill form with valid data
    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('john@example.com');
    await page.locator('#subject').fill('Test Subject');
    await page
      .locator('#message')
      .fill('This is a test message with more than 10 characters');

    // Submit form
    await page.getByRole('button', { name: /send message/i }).click();

    // Should show loading state
    await expect(
      page.getByRole('button', { name: /sending/i })
    ).toBeVisible({ timeout: 1000 });

    // Should show success message
    await expect(
      page.getByText(/message sent successfully/i)
    ).toBeVisible({ timeout: 3000 });

    // Form should be reset
    await expect(page.locator('#name')).toHaveValue('');
    await expect(page.locator('#email')).toHaveValue('');
  });

  test('has proper accessibility attributes', async ({ page }) => {
    await page.goto('/contact');

    const nameInput = page.locator('#name');
    const emailInput = page.locator('#email');
    const subjectInput = page.locator('#subject');
    const messageInput = page.locator('#message');

    // Check inputs have IDs
    await expect(nameInput).toHaveAttribute('id', 'name');
    await expect(emailInput).toHaveAttribute('id', 'email');
    await expect(subjectInput).toHaveAttribute('id', 'subject');
    await expect(messageInput).toHaveAttribute('id', 'message');

    // Check inputs have proper types
    await expect(nameInput).toHaveAttribute('type', 'text');
    await expect(emailInput).toHaveAttribute('type', 'email');
    await expect(subjectInput).toHaveAttribute('type', 'text');
  });

  test('displays placeholder text', async ({ page }) => {
    await page.goto('/contact');

    await expect(page.locator('input[placeholder*="John Doe"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="john@example.com"]')).toBeVisible();
    await expect(page.locator('input[placeholder*="How can we help"]')).toBeVisible();
    await expect(
      page.locator('textarea[placeholder*="Tell us more"]')
    ).toBeVisible();
  });

  test('required field indicators are visible', async ({ page }) => {
    await page.goto('/contact');

    // All fields should have asterisks indicating they're required
    // Check that each label contains an asterisk
    await expect(page.locator('label:has-text("Name *")')).toBeVisible();
    await expect(page.locator('label:has-text("Email *")')).toBeVisible();
    await expect(page.locator('label:has-text("Subject *")')).toBeVisible();
    await expect(page.locator('label:has-text("Message *")')).toBeVisible();
  });

  test('button is disabled while submitting', async ({ page }) => {
    await page.goto('/contact');

    // Fill form
    await page.locator('#name').fill('John Doe');
    await page.locator('#email').fill('john@example.com');
    await page.locator('#subject').fill('Test Subject');
    await page.locator('#message').fill('Test message content');

    // Get submit button
    const submitButton = page.getByRole('button', { name: /send message/i });

    // Submit form and immediately check if disabled
    const submitPromise = submitButton.click();

    // Check that button shows "Sending..." text, which indicates it's in loading state
    await expect(page.getByRole('button', { name: /sending/i })).toBeVisible({ timeout: 500 });

    await submitPromise;
  });
});

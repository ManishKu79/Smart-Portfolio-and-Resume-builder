import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should register a new user', async ({ page }) => {
    await page.goto('/register');
    
    await page.fill('input[name="name"]', 'E2E Test User');
    await page.fill('input[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[name="password"]', 'test123456');
    await page.fill('input[name="confirmPassword"]', 'test123456');
    
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('.sonner-toast')).toContainText('Registration successful');
  });

  test('should login successfully', async ({ page }) => {
    // First register a user
    const email = `login-${Date.now()}@example.com`;
    
    await page.goto('/register');
    await page.fill('input[name="name"]', 'Login Test User');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'test123456');
    await page.fill('input[name="confirmPassword"]', 'test123456');
    await page.click('button[type="submit"]');
    
    // Then login
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
    
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'invalid@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.sonner-toast')).toContainText('Invalid email or password');
  });
});
import { test, expect } from '@playwright/test';

test.describe('Resume Builder', () => {
  let authToken;

  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'test123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should create a new resume', async ({ page }) => {
    await page.click('a[href="/resume-builder/new"]');
    
    await page.fill('input[placeholder="Resume Title"]', 'My Test Resume');
    await page.fill('input[name="fullName"]', 'John Doe');
    await page.fill('input[name="jobTitle"]', 'Software Engineer');
    await page.fill('input[name="email"]', 'john@example.com');
    
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('.sonner-toast')).toContainText('Resume created successfully');
  });

  test('should add work experience', async ({ page }) => {
    await page.goto('/resume-builder/new');
    
    await page.click('button:has-text("Experience")');
    await page.click('button:has-text("Add Experience")');
    
    await page.fill('input[placeholder="Company name"]', 'Tech Corp');
    await page.fill('input[placeholder="Job title"]', 'Senior Developer');
    await page.fill('textarea[placeholder="Describe your responsibilities"]', 'Developed amazing features');
    
    await page.click('button:has-text("Save")');
    
    await expect(page.locator('.experience-item')).toContainText('Tech Corp');
  });
});
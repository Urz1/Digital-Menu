import { test, expect } from '@playwright/test';

test.describe('Owner and Staff Authentication & Access Gating Flow', () => {
  test('1. Unauthenticated user accessing /admin is gated and redirected to /admin/login', async ({ page, context }) => {
    // Clear cookies & test session in localStorage to simulate fresh real user
    await context.clearCookies();
    await page.goto('/admin/login');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.setItem('admin_explicitly_logged_out', 'true');
    });

    // Try navigating directly to /admin
    await page.goto('/admin');

    // Must be redirected to /admin/login
    await expect(page).toHaveURL(/.*\/admin\/login/);
    await expect(page.locator('h1:has-text("Restaurant Portal")')).toBeVisible();
    await expect(page.locator('button:has-text("Restaurant Owner")')).toBeVisible();
    await expect(page.locator('button:has-text("Staff Portal")')).toBeVisible();
  });

  test('2. Owner login: Rejects incorrect password and accepts seeded credentials', async ({ page }) => {
    await page.goto('/admin/login');

    // 1. Enter wrong password
    await page.locator('input[placeholder*="owner@addiscafeteria.com"]').fill('owner@addiscafeteria.com');
    await page.locator('input[placeholder="••••••••••••"]').fill('WrongPassword123');
    await page.locator('button:has-text("Sign In as Owner")').click();

    // Verify rejection error
    await expect(page.locator('text=Incorrect owner password. Access denied.')).toBeVisible();

    // 2. Enter correct seeded owner password
    await page.locator('input[placeholder="••••••••••••"]').fill('Owner@2026');
    await page.locator('button:has-text("Sign In as Owner")').click();

    // Must land on /admin dashboard as Owner
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('owner Mode');
    await expect(page.locator('[data-testid="admin-signout-btn"]')).toBeVisible();
  });

  test('3. Staff login: Rejects incorrect PIN and accepts seeded staff credentials', async ({ page }) => {
    await page.goto('/admin/login');

    // Switch to Staff tab
    await page.locator('button:has-text("Staff Portal")').click();

    // 1. Enter wrong PIN
    await page.locator('input[placeholder*="staff_selam"]').fill('staff_selam');
    await page.locator('input[placeholder="Enter staff password or PIN"]').fill('9999');
    await page.locator('button:has-text("Open Staff Console")').click();

    // Verify rejection
    await expect(page.locator('text=Incorrect staff password / PIN. Access denied.')).toBeVisible();

    // 2. Enter correct seeded staff PIN
    await page.locator('input[placeholder="Enter staff password or PIN"]').fill('1234');
    await page.locator('button:has-text("Open Staff Console")').click();

    // Must land on /admin in Staff Mode
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('staff Mode');

    // Staff cannot see Settings & Staff or Design Studio in navigation
    await expect(page.locator('[data-testid="admin-nav-settings"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="admin-nav-design"]')).not.toBeVisible();
  });

  test('4. Sign Out clears session and returns to login screen', async ({ page }) => {
    await page.goto('/admin/login');

    // Login as Owner
    await page.locator('input[placeholder*="owner@addiscafeteria.com"]').fill('owner@addiscafeteria.com');
    await page.locator('input[placeholder="••••••••••••"]').fill('Owner@2026');
    await page.locator('button:has-text("Sign In as Owner")').click();
    await expect(page).toHaveURL(/.*\/admin/);

    // Wait for dashboard and click Sign Out
    const signoutBtn = page.locator('[data-testid="admin-signout-btn"]');
    await expect(signoutBtn).toBeVisible();
    await signoutBtn.click();

    // Must be returned to /admin/login
    await expect(page).toHaveURL(/.*\/admin\/login/);
    await expect(page.locator('h1:has-text("Restaurant Portal")')).toBeVisible();

    // Re-accessing /admin directly should now fail and redirect back
    await page.goto('/admin');
    await expect(page).toHaveURL(/.*\/admin\/login/);
  });
});

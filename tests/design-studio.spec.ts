import { test, expect } from '@playwright/test';

test.describe('Owner Design Studio & Live Menu Theme Reflection Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Navigate to Design Studio (handles both desktop sidebar and mobile bottom nav)
    const designSidebarBtn = page.locator('aside [data-testid="admin-nav-design"]:visible');
    if (await designSidebarBtn.isVisible()) {
      await designSidebarBtn.click({ force: true });
    } else {
      const moreBtn = page.locator('[data-testid="mobile-bottom-more-btn"]:visible');
      if (await moreBtn.isVisible()) {
        await moreBtn.click();
      }
      const designMobileBtn = page.locator('[data-testid="admin-nav-design"]:visible');
      await designMobileBtn.click({ force: true });
    }
    await expect(page.locator('h2:has-text("Design Studio & Live Preview")')).toBeVisible();
  });

  test('1. Preset selection instantly updates phone preview and changes root tokens on publish', async ({ page }) => {
    // 1. Check live phone preview is visible
    const preview = page.locator('[data-testid="live-phone-preview"]');
    await expect(preview).toBeVisible();

    // 2. Select "Botanical Emerald" preset
    const emeraldPreset = page.locator('button:has-text("Botanical Emerald")');
    await expect(emeraldPreset).toBeVisible();
    await emeraldPreset.click();

    // Verify phone preview container has updated primary color
    const previewPrimary = await preview.evaluate((el) => {
      return (el as HTMLElement).style.getPropertyValue('--primary') || getComputedStyle(el).getPropertyValue('--primary');
    });
    expect(previewPrimary).toBe('#059669');

    // Also verify "All Items" pill inside preview has background color #059669 (rgb(5, 150, 105))
    const allItemsPill = preview.locator('span:has-text("All Items")');
    await expect(allItemsPill).toHaveCSS('background-color', 'rgb(5, 150, 105)');

    // 3. Click "Publish Design Changes"
    const publishBtn = page.locator('button:has-text("Publish Design Changes")');
    await expect(publishBtn).toBeVisible();
    await publishBtn.click();

    // Verify toast notification appears
    await expect(page.locator('text=Design settings and brand configuration published')).toBeVisible();

    // 4. Verify document.documentElement has root CSS variables updated
    const rootPrimary = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--primary');
    });
    expect(rootPrimary).toBe('#059669');

    const rootPrimaryRgb = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--primary-rgb');
    });
    expect(rootPrimaryRgb).toBe('5, 150, 105');
  });

  test('2. Customer dining menu at /addis reflects published theme and persists across reload', async ({ page }) => {
    // 1. Select "Botanical Emerald" preset & publish
    const emeraldPreset = page.locator('button:has-text("Botanical Emerald")');
    await emeraldPreset.click();

    const publishBtn = page.locator('button:has-text("Publish Design Changes")');
    await publishBtn.click();
    await expect(page.locator('text=Design settings and brand configuration published')).toBeVisible();

    // 2. Navigate to customer menu at /addis
    await page.goto('/addis');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // 3. Verify CSS variable on customer menu
    const menuPrimary = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--primary');
    });
    expect(menuPrimary).toBe('#059669');

    const menuPrimaryRgb = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--primary-rgb');
    });
    expect(menuPrimaryRgb).toBe('5, 150, 105');

    // 4. Reload customer menu and verify persistence
    await page.reload();
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    const reloadedPrimary = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--primary');
    });
    expect(reloadedPrimary).toBe('#059669');
  });

  test('3. Custom color picker change updates both preview and dining menu', async ({ page }) => {
    // 1. Switch to "Colors & Contrast" tab
    const colorsTabBtn = page.locator('button:has-text("Colors & Contrast")');
    await colorsTabBtn.click();
    await expect(page.locator('text=Brand Colors & WCAG 2.2 AA Contrast')).toBeVisible();

    // 2. Change Primary Brand Color to purple (#8B5CF6)
    const colorInput = page.locator('[data-testid="design-primary-color"]');
    await colorInput.fill('#8b5cf6');

    // Verify phone preview immediately updates to purple
    const preview = page.locator('[data-testid="live-phone-preview"]');
    const previewPrimary = await preview.evaluate((el) => {
      return (el as HTMLElement).style.getPropertyValue('--primary') || getComputedStyle(el).getPropertyValue('--primary');
    });
    expect(previewPrimary.toLowerCase()).toBe('#8b5cf6');

    // 3. Click "Publish Design Changes"
    const publishBtn = page.locator('button:has-text("Publish Design Changes")');
    await publishBtn.click();
    await expect(page.locator('text=Design settings and brand configuration published')).toBeVisible();

    // 4. Visit customer menu
    await page.goto('/addis');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    const menuPrimary = await page.evaluate(() => {
      return document.documentElement.style.getPropertyValue('--primary');
    });
    expect(menuPrimary.toLowerCase()).toBe('#8b5cf6');
  });

  test('4. Cross-tab instant theme synchronization without page reload', async ({ context }) => {
    // Open customer menu tab
    const customerPage = await context.newPage();
    await customerPage.goto('/addis');
    await expect(customerPage.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Open admin tab
    const adminPage = await context.newPage();
    await adminPage.goto('/admin');
    await expect(adminPage.locator('[data-hydrated="true"]')).toBeVisible();

    const designSidebarBtn = adminPage.locator('aside [data-testid="admin-nav-design"]:visible');
    if (await designSidebarBtn.isVisible()) {
      await designSidebarBtn.click({ force: true });
    } else {
      const moreBtn = adminPage.locator('[data-testid="mobile-bottom-more-btn"]:visible');
      if (await moreBtn.isVisible()) {
        await moreBtn.click();
      }
      const designMobileBtn = adminPage.locator('[data-testid="admin-nav-design"]:visible');
      await designMobileBtn.click({ force: true });
    }

    // Pick "Ruby Steakhouse" (#E11D48)
    const rubyPreset = adminPage.locator('button:has-text("Ruby Steakhouse")');
    await rubyPreset.click();

    // Publish
    const publishBtn = adminPage.locator('button:has-text("Publish Design Changes")');
    await publishBtn.click();
    await expect(adminPage.locator('text=Design settings and brand configuration published')).toBeVisible();

    // Check customerPage WITHOUT reload!
    await expect.poll(async () => {
      return await customerPage.evaluate(() => {
        return document.documentElement.style.getPropertyValue('--primary');
      });
    }, { timeout: 8000 }).toBe('#E11D48');

    await customerPage.close();
    await adminPage.close();
  });
});

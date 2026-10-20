import { test, expect } from '@playwright/test';
import { rateLimiter } from '../src/lib/rate-limiter';

test.describe('STAGE 6: Launch Readiness & QR Studio Suite', () => {

  test('1. QR Studio: Navigation, Templates, Table Parameters & Scanning Advice', async ({ page }) => {
    // Navigate to admin
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Click "Share QR" quick action from Home
    const shareQrBtn = page.getByTestId('quick-share-qr');
    await expect(shareQrBtn).toBeVisible();
    await shareQrBtn.click();

    // Verify QR Studio container is active
    const qrStudio = page.getByTestId('qr-studio-container');
    await expect(qrStudio).toBeVisible();

    // Verify scanning reliability tips are prominently displayed
    await expect(page.getByText('Reliable Scanning Advice for Owners')).toBeVisible();
    await expect(page.getByText('Minimum Size:')).toBeVisible();
    await expect(page.getByText('Contrast:')).toBeVisible();

    // Verify Table Tent template preview is displayed by default with Digital Menu badge
    await expect(page.getByTestId('preview-tent-card')).toBeVisible();
    await expect(page.getByTestId('preview-tent-card').getByText('Digital Menu')).toBeVisible();

    // Verify QR code uses offline vector SVG data URI
    const tentQrImg = page.getByTestId('preview-tent-card').locator('img');
    await expect(tentQrImg).toBeVisible();
    const tentQrSrc = await tentQrImg.getAttribute('src');
    expect(tentQrSrc).toContain('data:image/svg+xml');

    // Switch to Compact Sticker template
    await page.getByTestId('template-sticker-btn').click();
    await expect(page.getByTestId('preview-sticker-card')).toBeVisible();
    await expect(page.getByTestId('preview-sticker-card').getByText('Scan Menu')).toBeVisible();

    // Switch to A4 Cut Sheet template (8 Cards)
    await page.getByTestId('template-a4-btn').click();
    await expect(page.getByTestId('preview-a4-sheet')).toBeVisible();
    await expect(page.getByText('A4 Sheet Cutting Guide')).toBeVisible();
    await expect(page.getByText('Cut along dotted lines to separate stands (8 cards)')).toBeVisible();

    // Verify 8 cards rendered without table numbers
    const a4CardImages = page.getByTestId('preview-a4-sheet').locator('img');
    await expect(a4CardImages).toHaveCount(8);
  });

  test('2. PWA: Repeat-Visitor Install Hint & Graceful Offline Banner', async ({ page }) => {
    // Initial visit: start clean
    await page.goto('/addis');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Verify that customer menu remains clean and frictionless without install banners
    const installBanner = page.getByTestId('pwa-install-banner');
    expect(await installBanner.isVisible().catch(() => false)).toBe(false);

    // Simulate offline condition in browser
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
    });

    // Graceful offline banner should display calm warning
    const offlineBanner = page.getByTestId('pwa-offline-banner');
    await expect(offlineBanner).toBeVisible();
    await expect(page.getByText("You're offline — showing cached menu and offline cart")).toBeVisible();
  });

  test('3. SEO & Sharing: Server-rendered Open Graph & Schema.org Structured Data', async ({ page }) => {
    await page.goto('/addis');
    await page.waitForLoadState('networkidle');

    // Verify title and meta tags
    const title = await page.title();
    expect(title).toContain('Addis');

    // Verify Open Graph & Twitter meta tags exist in DOM
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toContain('Addis');

    const ogType = await page.locator('meta[property="og:type"]').getAttribute('content');
    expect(ogType).toBe('website');

    // Verify Schema.org JSON-LD script
    const jsonLdContent = await page.locator('script[type="application/ld+json"]').textContent();
    expect(jsonLdContent).not.toBeNull();
    const parsedSchema = JSON.parse(jsonLdContent || '{}');
    expect(parsedSchema['@type']).toBe('Restaurant');
    expect(parsedSchema.name).toContain('Addis');
    expect(parsedSchema.hasMenu).toBeDefined();
    expect(parsedSchema.hasMenu.hasMenuSection.length).toBeGreaterThan(0);
  });

  test('4. Privacy: Dedicated Notice Page & Admin Tenant Export / Purge Controls', async ({ page }) => {
    // Navigate to tenant privacy notice page
    await page.goto('/addis/privacy');
    await page.waitForLoadState('networkidle');

    // Verify privacy page renders with zero-cookie guarantee
    await expect(page.getByTestId('privacy-page-container')).toBeVisible();
    await expect(page.getByText('Zero-Tracking & Cookie-Free Guarantee')).toBeVisible();
    await expect(page.getByText('No Tracking Cookies')).toBeVisible();
    await expect(page.getByText('Anonymous Dining')).toBeVisible();

    // Navigate to Admin Settings
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    const settingsBtn = page.locator('aside [data-testid="admin-nav-settings"]').or(page.locator('button:has-text("Settings & Staff")'));
    if (await settingsBtn.first().isVisible().catch(() => false)) {
      await settingsBtn.first().click();
    } else {
      await page.getByTestId('mobile-bottom-more-btn').click();
      await page.locator('button:has-text("Settings & Staff"):visible').click();
    }

    // Verify Privacy & Data Compliance section in Settings
    await expect(page.getByText('Data Privacy & Tenant Ownership')).toBeVisible();
    await expect(page.getByTestId('export-tenant-data-btn')).toBeVisible();
    await expect(page.getByTestId('purge-guest-data-btn')).toBeVisible();
  });

  test('5. Rate Limiter Engine: Pure Unit Tests for Dining Room Protections', async () => {
    rateLimiter.reset();

    const config = { maxRequests: 3, windowMs: 1000 };
    const key = 'table-14-waiter-calls';

    // 1st, 2nd, 3rd requests should be allowed
    const r1 = rateLimiter.check(key, config);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);

    const r2 = rateLimiter.check(key, config);
    expect(r2.allowed).toBe(true);
    expect(r2.remaining).toBe(1);

    const r3 = rateLimiter.check(key, config);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);

    // 4th request must be blocked
    const r4 = rateLimiter.check(key, config);
    expect(r4.allowed).toBe(false);
    expect(r4.remaining).toBe(0);
    expect(r4.errorMessage).toContain('Too many requests');
  });

  test('6. Reliability: Friendly 404 Pages for Invalid Slugs', async ({ page }) => {
    // Tenant 404 when slug does not exist
    await page.goto('/non-existent-menu-slug-12345');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('This menu is currently unavailable')).toBeVisible();
    await expect(page.getByRole('link', { name: /Addis Restaurant Demo/i })).toBeVisible();
  });

});

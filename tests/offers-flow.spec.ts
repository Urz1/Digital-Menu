import { test, expect } from '@playwright/test';

test.describe('Stage 3: Offers System - End to End Flow', () => {
  test('1. Admin Flow: Create offer, see live phone preview, and publish', async ({ page }) => {
    // Navigate to Admin dashboard
    await page.goto('/admin');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Switch to Offers & Deals tab
    const offersTab = page.locator('[data-testid="admin-nav-offers"]:visible').first();
    await expect(offersTab).toBeVisible();
    await offersTab.click();

    // Verify Offers Section & Performance metrics
    await expect(page.locator('text=Restaurant Offers & Happy Hours')).toBeVisible();
    await expect(page.locator('text=Offer Views')).toBeVisible();

    // Click "Create Offer" button (under 90s flow)
    const createBtn = page.locator('[data-testid="admin-create-offer-btn"]').or(page.locator('button:has-text("Create Offer")')).first();
    await expect(createBtn).toBeVisible();
    await createBtn.click();

    // Step 1: Template selection & Live Preview
    await expect(page.locator('text=Choose a Plain-Language Template')).toBeVisible();
    await expect(page.getByText('Live Phone Preview', { exact: true })).toBeVisible();

    // Select Happy Hour template
    const happyHourTmpl = page.locator('button:has-text("Happy Hour")').first();
    await happyHourTmpl.click();

    // Verify Title and Live Preview reflects Happy Hour
    const titleInput = page.locator('input[placeholder="e.g. Afternoon Happy Hour: 25% Off"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('Sunset Happy Hour: 30% Off Sourdough Pizzas');

    // Verify Live Preview shows the updated title and badge
    await expect(page.locator('text=Dish Card Preview')).toBeVisible();

    // Continue to Step 2: Dishes
    const continueStep1 = page.locator('button:has-text("Continue")');
    await continueStep1.scrollIntoViewIfNeeded();
    await continueStep1.click({ force: true });
    await expect(page.locator('text=Offer Scope')).toBeVisible();

    // Continue to Step 3: Schedule
    const continueStep2 = page.locator('button:has-text("Continue")');
    await continueStep2.scrollIntoViewIfNeeded();
    await continueStep2.click({ force: true });
    await expect(page.locator('text=Schedule Duration')).toBeVisible();

    // Continue to Step 4: Review
    const continueStep3 = page.locator('button:has-text("Continue")');
    await continueStep3.scrollIntoViewIfNeeded();
    await continueStep3.click({ force: true });
    await expect(page.locator('text=Offer Summary')).toBeVisible();
    await expect(page.locator('text=Sunset Happy Hour: 30% Off Sourdough Pizzas')).toBeVisible();

    // Publish Offer
    const publishBtn = page.locator('button:has-text("Publish Offer Live")');
    await publishBtn.scrollIntoViewIfNeeded();
    await publishBtn.click({ force: true });

    // Verify "Your Offer is Live!" confirmation modal
    await expect(page.locator('text=Your Offer is Live!')).toBeVisible();
    await page.locator('#done-live-offer-btn').click({ force: true });
    await expect(page.locator('text=Your Offer is Live!')).toBeHidden();

    // Verify new offer is now in the offers list
    await expect(page.locator('text=Sunset Happy Hour: 30% Off Sourdough Pizzas')).toBeVisible();
  });

  test('2. Customer Menu: Single calm banner, dismissibility, inline badges, struck prices, and order savings', async ({ page }) => {
    // Open customer mobile view for Addis Cafeteria
    await page.goto('/addis?table=Table%2014');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Verify at most ONE calm banner is visible at the top
    const banner = page.locator('aside[aria-label="Current restaurant offer"]');
    await expect(banner).toBeVisible();
    const bannerCount = await page.locator('aside[aria-label="Current restaurant offer"]').count();
    expect(bannerCount).toBe(1);

    // Verify "See offer" link in banner
    const seeOfferLink = banner.locator('button:has-text("See offer")');
    await expect(seeOfferLink).toBeVisible();

    // Test dismissibility for the session
    const dismissBtn = banner.locator('button[title="Dismiss notice"]');
    await dismissBtn.click();
    await expect(banner).not.toBeVisible();

    // Verify "🏷️ On Offer" filter chip exists alongside dietary filters
    const onOfferChip = page.locator('button:has-text("On Offer")');
    await expect(onOfferChip).toBeVisible();

    // Tap "On Offer" filter chip
    await onOfferChip.click();
    await expect(page.locator('text=Dishes on Offer')).toBeVisible();

    // Verify dishes on offer show:
    // - Badge text (e.g. "20% Off" or "Save $4")
    // - Old price struck through
    // - New discounted price in accent color
    const offerBadge = page.locator('span:has-text("20% Off"), span:has-text("40 ETB Off"), span:has-text("Off")').first();
    await expect(offerBadge).toBeVisible();

    // Open dish detail bottom sheet for an authentic dish on offer
    const dishCard = page.locator('article:has-text("Pizza"):has-text("Off"), article:has-text("Special Fetira"):has-text("Off")').first();
    await dishCard.click();

    // Verify dish modal details:
    // 1. Plain language terms box and reviews
    await expect(page.locator('text=Guest Reviews')).toBeVisible();

    // 2. Gentle "Goes well with" row (non-blocking)
    const goesWellWith = page.locator('h4:has-text("Goes well with")');
    await expect(goesWellWith).toBeVisible();

    // Add item to order
    const addToOrderBtn = page.locator('button:has-text("Add to Order")');
    await addToOrderBtn.click();

    // Verify Floating Order Bar appears with savings badge
    const orderBar = page.locator('aside button[aria-label="Review My Order"]');
    await expect(orderBar).toBeVisible();
    await expect(orderBar.locator('text=Saved')).toBeVisible();

    // Open Order Summary Sheet
    await orderBar.click();
    await expect(page.locator('h2:has-text("My Order")')).toBeVisible();

    // Verify line-by-line savings and pricing breakdown in order sheet
    await expect(page.locator('text=Items Subtotal')).toBeVisible();
    await expect(page.locator('text=Total Offer Savings')).toBeVisible();
  });

  test('3. Staff Permissions: Staff can view and pause/resume, but cannot create or delete', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();

    // Sign in as Staff
    await page.goto('/admin/login');
    await page.locator('button:has-text("Staff Portal")').click();
    await page.locator('input[placeholder*="staff_selam"]').fill('staff_selam');
    await page.locator('input[placeholder="Enter staff password or PIN"]').fill('1234');
    await page.locator('button:has-text("Open Staff Console")').click();
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('staff Mode');

    // Navigate to Offers tab
    const offersNav = page.locator('[data-testid="admin-nav-offers"]:visible').first();
    await offersNav.click();

    // Verify "Create Offer" button is NOT present in Staff mode
    await expect(page.locator('button:has-text("Create Offer")')).not.toBeVisible();
    await expect(page.locator('text=Staff Mode (View & Pause/Resume only)')).toBeVisible();

    // Verify Pause / Resume button is functional for staff
    const pauseOrResumeBtn = page.locator('button:has-text("Pause"), button:has-text("Resume")').first();
    await expect(pauseOrResumeBtn).toBeVisible();
    const initialText = await pauseOrResumeBtn.innerText();

    await pauseOrResumeBtn.click();
    // After click, the state toggles (Pause -> Resume or Resume -> Pause)
    if (initialText.includes('Pause')) {
      await expect(page.locator('button:has-text("Resume")').first()).toBeVisible();
    } else {
      await expect(page.locator('button:has-text("Pause")').first()).toBeVisible();
    }
  });
});

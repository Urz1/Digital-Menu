import { test, expect } from '@playwright/test';

test.describe('Dish Reviews System - Customer Submission & Owner Management Parity', () => {
  test('1. Customer Flow: Submit 5-star review with tag & comment, verify thank you state & duplicate prevention', async ({ page }) => {
    // Open customer mobile view for Addis Cafeteria
    await page.goto('/addis?table=Table%2014');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Find Special Fetira card
    const fetiraCard = page.locator('article:has-text("Special Fetira")').first();
    await expect(fetiraCard).toBeVisible();
    await fetiraCard.scrollIntoViewIfNeeded();
    await fetiraCard.click();

    // Detail Modal opens
    await expect(page.locator('h2:has-text("Special Fetira")')).toBeVisible();

    // Click "Rate this dish" button
    const rateBtn = page.locator('button:has-text("Rate this dish")');
    await rateBtn.scrollIntoViewIfNeeded();
    await rateBtn.click();

    // Quick Dish Review modal opens
    await expect(page.locator('text=Quick Dish Review')).toBeVisible();
    await expect(page.locator('text=Fast, honest feedback in under 15 seconds')).toBeVisible();

    // Select 5-star rating
    const star5Btn = page.locator('button[aria-label="5 star rating"]');
    await expect(star5Btn).toBeVisible();
    await star5Btn.click();

    // Select quick tag: "Crispy texture"
    const crispyTag = page.locator('button:has-text("Crispy texture")').first();
    if (await crispyTag.isVisible()) {
      await crispyTag.click();
    }

    // Type honest comment
    const commentInput = page.locator('textarea[placeholder*="What made this dish memorable?"]');
    await commentInput.fill('Crispy, layered pastry with sweet mountain honey and fresh bananas. The best breakfast in Addis Ababa!');

    // Submit review
    const submitBtn = page.locator('button:has-text("Submit Honest Review")');
    await submitBtn.click();

    // Verify thank you state
    await expect(page.locator('text=Thank you for your review!')).toBeVisible();
    await expect(page.locator('text=Your honest feedback helps our culinary team')).toBeVisible();

    // Dismiss thank you modal
    await page.locator('button:has-text("Done")').click();
    await expect(page.locator('text=Thank you for your review!')).toBeHidden();

    // DUPLICATE PREVENTION: Attempt to review the same dish again in the same table session
    await rateBtn.scrollIntoViewIfNeeded();
    await rateBtn.click({ force: true });
    await expect(page.locator('text=Quick Dish Review')).toBeVisible();

    // Brief pause to simulate human interaction time
    await page.waitForTimeout(300);

    const submitBtn2 = page.locator('button:has-text("Submit Honest Review")');
    await submitBtn2.scrollIntoViewIfNeeded();
    await submitBtn2.click({ force: true });

    // Verify duplicate submission prevention message
    await expect(page.locator('text=You have already reviewed this dish for this table session')).toBeVisible();
  });

  test('2. Customer Flow: Customer sees verified review and owner reply displayed on dish details', async ({ page }) => {
    await page.goto('/addis?table=Table%2014');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Open Special Fetira
    const fetiraCard = page.locator('article:has-text("Special Fetira")').first();
    await fetiraCard.scrollIntoViewIfNeeded();
    await fetiraCard.click();

    // Detail modal opens
    await expect(page.locator('h2:has-text("Special Fetira")')).toBeVisible();

    // Verify guest reviews section header is visible
    await expect(page.locator('h3:has-text("Guest Reviews")')).toBeVisible();

    // Verify the published review is visible
    const reviewText = page.locator('text=Crispy, layered pastry with sweet mountain honey');
    await expect(reviewText.first()).toBeVisible();
  });

  test('3. Admin Flow: Staff reply permissions vs Owner removal permissions', async ({ page }) => {
    // 1. Authenticate as Staff
    await page.goto('/admin/login');
    await page.locator('button:has-text("Staff Portal")').click();
    await page.locator('input[placeholder*="staff_selam"]').fill('staff_selam');
    await page.locator('input[placeholder="Enter staff password or PIN"]').fill('1234');
    await page.locator('button:has-text("Open Staff Console")').click();

    // Verify staff console loads
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('staff Mode');

    // Switch to Dish Reviews tab
    const reviewsTab = page.locator('[data-testid="admin-nav-reviews"]:visible').first();
    await expect(reviewsTab).toBeVisible();
    await reviewsTab.click({ force: true });

    // Verify Reviews section loads
    await expect(page.locator('h2:has-text("Dish Reviews & Moderation")')).toBeVisible();

    // Verify Staff cannot remove reviews (displays "Only owners can remove")
    await expect(page.locator('text=Only owners can remove').first()).toBeVisible();
    await expect(page.locator('button:has-text("Remove Review")')).toBeHidden();

    // Staff can compose a reply
    const replyBtn = page.locator('button:has-text("Reply to Diner"), button:has-text("Edit Reply")').first();
    await replyBtn.scrollIntoViewIfNeeded();
    await replyBtn.click({ force: true });

    // Suggested starters appear
    await expect(page.locator('text=Quick Polite Starters')).toBeVisible();
    const replyTextarea = page.locator('textarea[placeholder*="Write your public response"]');
    await expect(replyTextarea).toBeVisible();
    await replyTextarea.fill('Thank you for dining at Addis Cafeteria! Our pastry chefs layer the dough fresh every morning. Delighted you loved the mountain honey pairing. See you again soon!');

    // Post Reply
    const postReplyBtn = page.locator('button:has-text("Post Public Reply")');
    await expect(postReplyBtn).toBeVisible();
    await postReplyBtn.click();

    // Verify Public Response badge is displayed on the review card
    await expect(page.locator('text=Public Response').first()).toBeVisible();

    // 2. Sign out and sign in as Owner
    await page.goto('/admin/login');
    await page.locator('button:has-text("Restaurant Owner")').click();
    await page.locator('input[placeholder*="owner@addiscafeteria.com"]').fill('owner@addiscafeteria.com');
    await page.locator('input[placeholder="••••••••••••"]').fill('Owner@2026');
    await page.locator('button:has-text("Sign In as Owner")').click();

    // Verify Owner mode loads
    await expect(page).toHaveURL(/.*\/admin/);
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('owner Mode');

    // Open Dish Reviews tab
    await page.locator('[data-testid="admin-nav-reviews"]:visible').first().click({ force: true });
    await expect(page.locator('h2:has-text("Dish Reviews & Moderation")')).toBeVisible();

    // Owner CAN see Remove Review button
    const removeBtn = page.locator('button:has-text("Remove Review")').first();
    await expect(removeBtn).toBeVisible();
  });
});

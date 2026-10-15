import { test, expect } from '@playwright/test';

test.describe('Stage 4: Dish Reviews System - End to End Flow', () => {
  test('1. Customer Flow: 3-Review Threshold (visible only when count >= 3, hidden when < 3)', async ({ page }) => {
    // Open customer mobile view for Addis Cafeteria
    await page.goto('/addis?table=Table%2014');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Dish with >= 3 reviews: "Tartufo & Wild Morel Sourdough Pizza" (has 4 reviews)
    const pizzaCard = page.locator('article:has-text("Tartufo & Wild Morel Sourdough Pizza")');
    await expect(pizzaCard).toBeVisible();

    // Verify rating badge is visible on the card (contains 4.8 and count 4)
    await expect(pizzaCard.locator('text=4.8')).toBeVisible();
    await expect(pizzaCard.locator('text=(4)')).toBeVisible();

    // Dish with < 3 reviews: "Crispy Point Judith Calamari Fritti" (has 1 review)
    const calamariCard = page.locator('article:has-text("Crispy Point Judith Calamari Fritti")');
    await expect(calamariCard).toBeVisible();

    // Verify rating badge is NOT visible on the card
    await expect(calamariCard.locator('text=4.8')).toBeHidden();
    await expect(calamariCard.locator('text=(1)')).toBeHidden();
  });

  test('2. Customer Flow: Submit dish review in under 15 seconds, see thank you state, and duplicate prevention', async ({ page }) => {
    await page.goto('/addis?table=Table%2014');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Open Calamari detail modal
    const calamariCard = page.locator('article:has-text("Crispy Point Judith Calamari Fritti")');
    await calamariCard.scrollIntoViewIfNeeded();
    await calamariCard.click();

    // Modal opens
    await expect(page.locator('h2:has-text("Crispy Point Judith Calamari Fritti")')).toBeVisible();

    // Click "Rate this dish" button
    const rateBtn = page.locator('button:has-text("Rate this dish")');
    await rateBtn.scrollIntoViewIfNeeded();
    await rateBtn.click();

    // Review Modal opens
    await expect(page.locator('text=Quick Dish Review')).toBeVisible();
    await expect(page.locator('text=Fast, honest feedback in under 15 seconds')).toBeVisible();

    // Tap 5-star rating (first star or 5th star button)
    const starBtn = page.locator('button[aria-label="5 star rating"]');
    await expect(starBtn).toBeVisible();
    await starBtn.click();

    // Tap quick tag: "Crispy texture"
    const tagBtn = page.locator('button:has-text("Crispy texture")').first();
    await tagBtn.click();

    // Type optional comment
    const commentInput = page.locator('textarea[placeholder*="What made this dish memorable?"]');
    await commentInput.fill('Incredible crunch and tender inside. The smoked paprika remoulade was lovely.');

    // Submit Review
    const submitBtn = page.locator('button:has-text("Submit Honest Review")');
    await submitBtn.click();

    // Friendly thank you state appears (no upsell, no redirect)
    await expect(page.locator('text=Thank you for your review!')).toBeVisible();
    await expect(page.locator('text=Your honest feedback helps our culinary team')).toBeVisible();

    // Click "Done"
    await page.locator('button:has-text("Done")').click();
    await expect(page.locator('text=Thank you for your review!')).toBeHidden();

    // DUPLICATE PREVENTION: Try reviewing the same dish again in the same session
    await rateBtn.scrollIntoViewIfNeeded();
    await rateBtn.click({ force: true });
    await expect(page.locator('text=Quick Dish Review')).toBeVisible();

    // Short pause so human duration > 0ms
    await page.waitForTimeout(200);

    const submitBtn2 = page.locator('button:has-text("Submit Honest Review")');
    await submitBtn2.scrollIntoViewIfNeeded();
    await submitBtn2.click({ force: true });

    // Displays rate limit / duplicate prevention message
    await expect(page.locator('text=You have already reviewed this dish for this table session')).toBeVisible();
  });

  test('3. Admin Flow: Inbox tabs, Staff reply permissions vs Owner removal permissions', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Switch to Dish Reviews tab
    const reviewsTab = page.locator('button:has-text("Dish Reviews")');
    await expect(reviewsTab).toBeVisible();
    await reviewsTab.click({ force: true });

    // Verify Weekly Summary card
    await expect(page.locator('text=Weekly Feedback Digest')).toBeVisible();
    await expect(page.locator('text=Guests love:')).toBeVisible();

    // Verify Inbox filters
    await expect(page.locator('button:has-text("Needs Attention")')).toBeVisible();

    // Switch to "Needs Attention" filter tab
    await page.locator('button:has-text("Needs Attention")').click({ force: true });

    // Should display the reported demo review
    await expect(page.locator('text=Check out cheap crypto telegram')).toBeVisible();
    await expect(page.locator('text=Reported by guests as spam advertisement')).toBeVisible();

    // Test STAFF PERMISSION: Switch to Staff Mode
    const staffModeBtn = page.locator('button:has-text("Staff Mode")');
    await staffModeBtn.scrollIntoViewIfNeeded();
    await staffModeBtn.click({ force: true });
    await expect(page.locator('text=Only owners can remove')).toBeVisible();
    await expect(page.locator('button:has-text("Remove Review")')).toBeHidden();

    // Staff can reply
    const replyBtn = page.locator('button:has-text("Reply to Diner")').first();
    await replyBtn.scrollIntoViewIfNeeded();
    await replyBtn.click({ force: true });

    // Suggested starters appear
    await expect(page.locator('text=Quick Polite Starters')).toBeVisible();
    const starterChip = page.locator('button:has-text("Thank you for your kind words")').first();
    await starterChip.scrollIntoViewIfNeeded();
    await starterChip.click({ force: true });

    // Staff posts reply
    const postReplyBtn = page.locator('button:has-text("Post Public Reply")');
    await postReplyBtn.scrollIntoViewIfNeeded();
    await postReplyBtn.click({ force: true });
    await expect(page.locator('text=Public Response')).toBeVisible();

    // Test OWNER PERMISSION: Switch back to Owner Mode
    const ownerModeBtn = page.locator('button:has-text("Owner Mode")');
    await ownerModeBtn.scrollIntoViewIfNeeded();
    await ownerModeBtn.click({ force: true });

    // Owner can remove review with required reason
    const removeBtn = page.locator('button:has-text("Remove Review")').first();
    await expect(removeBtn).toBeVisible();
    await removeBtn.scrollIntoViewIfNeeded();
    await removeBtn.click({ force: true });

    // Removal Modal appears with required reason
    await expect(page.locator('text=Moderate Review Removal')).toBeVisible();
    await expect(page.locator('text=Required Removal Reason:')).toBeVisible();

    // Select "Spam or advertisement"
    await page.locator('label:has-text("Spam or advertisement")').click({ force: true });

    // Confirm removal
    await page.locator('#confirm-remove-review-btn').click({ force: true });
    await expect(page.locator('text=Moderate Review Removal')).toBeHidden();

    // Verify audit log records the removal
    const auditLogBtn = page.locator('#open-audit-log-btn');
    await auditLogBtn.scrollIntoViewIfNeeded();
    await auditLogBtn.click({ force: true });
    await expect(page.locator('h3:has-text("Review Moderation Audit Log")')).toBeVisible();
    await expect(page.locator('text=remove').first()).toBeVisible();
  });
});

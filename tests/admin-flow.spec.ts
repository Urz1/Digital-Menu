import { test, expect } from '@playwright/test';

test.describe('Stage 5: Admin Experience - End to End Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin
    await page.goto('/admin');
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();
  });

  test('1. Onboarding Wizard: 5-step interactive wizard, instant WCAG contrast check, and checklist', async ({ page }) => {
    // Click "Resume 5-Min Setup Wizard" from Home Dashboard
    const resumeBtn = page.locator('button:has-text("Resume 5-Min Setup Wizard")');
    await resumeBtn.scrollIntoViewIfNeeded();
    await resumeBtn.click();

    // Wizard modal opens
    const wizardModal = page.locator('[data-testid="onboarding-wizard-modal"]');
    await expect(wizardModal).toBeVisible();
    await expect(wizardModal.locator('text=Step 1 of 5')).toBeVisible();

    // Step 1: Restaurant Name & Logo
    const nameInput = wizardModal.locator('[data-testid="onboarding-input-name"]');
    await nameInput.fill('Addis Grand Cafeteria');
    const nextBtn = wizardModal.locator('[data-testid="onboarding-next-button"]');
    await nextBtn.scrollIntoViewIfNeeded();
    await nextBtn.click();

    // Step 2: Brand Colors & WCAG Contrast
    await expect(wizardModal.locator('text=Step 2 of 5')).toBeVisible();
    await expect(wizardModal.locator('[data-testid="wizard-step-2"]')).toBeVisible();
    await expect(wizardModal.locator('text=Contrast Ratio:')).toBeVisible();
    await nextBtn.click();

    // Step 3: Hours & Languages
    await expect(wizardModal.locator('text=Step 3 of 5')).toBeVisible();
    await nextBtn.click();

    // Step 4: First Category & Dish
    await expect(wizardModal.locator('text=Step 4 of 5')).toBeVisible();
    const dishInput = wizardModal.locator('[data-testid="onboarding-input-dish"]');
    await dishInput.fill('Highland Wood-Fired Salmon');
    const priceInput = wizardModal.locator('[data-testid="onboarding-input-price"]');
    await priceInput.fill('24.00');
    await nextBtn.click();

    // Step 5: Celebration & QR Code
    await expect(wizardModal.locator('text=Step 5 of 5')).toBeVisible();
    await expect(wizardModal.locator('text=Your menu is live and ready!')).toBeVisible();
    await expect(wizardModal.locator('text=Table 14')).toBeVisible();

    // Finish onboarding
    const finishBtn = wizardModal.locator('[data-testid="onboarding-finish-button"]');
    await finishBtn.click();
    await expect(wizardModal).toBeHidden();

    // Toast feedback appears
    await expect(page.locator('[data-testid="admin-toast"]')).toBeVisible();
    await expect(page.locator('text=Setup complete')).toBeVisible();
  });

  test('2. Menu Management: Add new dish with essentials + more options, verify in list', async ({ page }) => {
    // Switch to Menu section
    const menuBtn = page.locator('button:has-text("Menu & Dishes")').or(page.locator('button:has-text("Menu")')).first();
    await menuBtn.scrollIntoViewIfNeeded();
    await menuBtn.click({ force: true });

    // Open Add Dish modal
    const addDishBtn = page.locator('[data-testid="add-dish-button"]');
    await addDishBtn.scrollIntoViewIfNeeded();
    await addDishBtn.click({ force: true });

    const formModal = page.locator('[data-testid="dish-form-modal"]');
    await expect(formModal).toBeVisible();

    // Fill essentials
    const nameInput = page.locator('[data-testid="dish-form-name"]');
    await nameInput.fill('Crispy Truffle Fries');
    const priceInput = page.locator('[data-testid="dish-form-price"]');
    await priceInput.fill('12.50');

    // Expand "More options"
    const moreOptionsBtn = page.locator('[data-testid="toggle-more-options"]');
    await moreOptionsBtn.scrollIntoViewIfNeeded();
    await moreOptionsBtn.click({ force: true });

    // Select Vegetarian tag
    const vegTag = page.locator('button:has-text("vegetarian")');
    await vegTag.click({ force: true });

    // Save dish
    const saveBtn = page.locator('[data-testid="save-dish-button"]');
    await saveBtn.scrollIntoViewIfNeeded();
    await saveBtn.click({ force: true });
    await expect(formModal).toBeHidden();

    // Toast feedback
    await expect(page.locator('[data-testid="admin-toast"]')).toBeVisible();

    // Search for newly created dish
    const searchInput = page.locator('[data-testid="menu-search-input"]');
    await searchInput.fill('Crispy Truffle Fries');
    await expect(page.locator('text=Crispy Truffle Fries')).toBeVisible();
    await expect(page.locator('text=12.50')).toBeVisible();
  });

  test('3. Availability Management: One-tap "Sold Out Today" toggle with instant visual feedback', async ({ page }) => {
    // Switch to Menu
    const menuBtn = page.locator('button:has-text("Menu & Dishes")').or(page.locator('button:has-text("Menu")')).first();
    await menuBtn.click({ force: true });

    // Locate the first sold out toggle
    const firstToggle = page.locator('button[data-testid^="sold-out-toggle-"]').first();
    await firstToggle.scrollIntoViewIfNeeded();

    const initialText = await firstToggle.innerText();
    await firstToggle.click({ force: true });

    // Verify toggle changed status and toast feedback appeared
    await expect(page.locator('[data-testid="admin-toast"]')).toBeVisible();
    if (initialText.includes('Available')) {
      await expect(firstToggle).toContainText('Sold Out Today');
    } else {
      await expect(firstToggle).toContainText('Available');
    }
  });

  test('4. Bulk Price Adjustment: Select dishes and apply percentage price adjustment', async ({ page }) => {
    // Switch to Menu
    const menuBtn = page.locator('button:has-text("Menu & Dishes")').or(page.locator('button:has-text("Menu")')).first();
    await menuBtn.click({ force: true });

    // Select first two dishes checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    if (count > 2) {
      await checkboxes.nth(1).check({ force: true });
      await checkboxes.nth(2).check({ force: true });
    }

    // Bulk action bar should be visible
    await expect(page.locator('text=dishes selected')).toBeVisible();

    // Click "Change Prices"
    const bulkPriceTrigger = page.locator('[data-testid="bulk-price-modal-trigger"]');
    await bulkPriceTrigger.click({ force: true });

    // Modal opens
    const modal = page.locator('[data-testid="bulk-price-modal"]');
    await expect(modal).toBeVisible();

    // Fill +15% price adjustment
    const valInput = page.locator('[data-testid="bulk-price-input-value"]');
    await valInput.fill('15');

    // Apply
    const applyBtn = page.locator('[data-testid="apply-bulk-price-btn"]');
    await applyBtn.click({ force: true });
    await expect(modal).toBeHidden();

    // Verify toast
    await expect(page.locator('[data-testid="admin-toast"]')).toBeVisible();
  });

  test('5. Role Permissions: Owner vs Manager vs Staff consoles', async ({ page }) => {
    // 1. OWNER has full access
    await expect(page.locator('[data-testid="role-btn-owner"]')).toBeVisible();
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('owner Mode');

    // 2. Switch to MANAGER Mode
    const managerBtn = page.locator('[data-testid="role-btn-manager"]');
    await managerBtn.click();
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('manager Mode');

    // Manager can access Menu, Offers, Reviews, Requests, Insights, but NOT Design Studio or Settings
    await expect(page.locator('button:has-text("Design Studio")')).toBeHidden();
    await expect(page.locator('button:has-text("Settings & QR")')).toBeHidden();

    // 3. Switch to STAFF Mode
    const staffBtn = page.locator('[data-testid="role-btn-staff"]');
    await staffBtn.click();
    await expect(page.locator('[data-testid="role-badge"]')).toContainText('staff Mode');

    // Staff cannot add dishes, cannot access Design, Settings, or Insights
    await expect(page.locator('[data-testid="add-dish-button"]')).toBeHidden();
    await expect(page.locator('button:has-text("Design Studio")')).toBeHidden();
    await expect(page.locator('button:has-text("Offers & Deals")')).toBeHidden();

    // Staff CAN navigate to Menu & Dishes to toggle sold out
    const menuBtn = page.locator('[data-testid="admin-nav-menu"]').first();
    await menuBtn.click();
    await expect(page.locator('button[data-testid^="sold-out-toggle-"]').first()).toBeVisible();
  });
});

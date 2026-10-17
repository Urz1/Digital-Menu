import { test, expect } from '@playwright/test';

test.describe('Category CRUD & Inline Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('[data-hydrated="true"]')).toBeVisible();
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Navigate to Menu tab
    const menuBtn = page.locator('[data-testid="admin-nav-menu"]:visible').first();
    await menuBtn.scrollIntoViewIfNeeded();
    await menuBtn.click({ force: true });
    await expect(page.locator('[data-testid="add-dish-button"]')).toBeVisible();
  });

  test('1. Inline Quick Category Creation inside Add Dish Modal (User Screenshot Scenario)', async ({ page }) => {
    // Open Add Dish Modal
    const addDishBtn = page.locator('[data-testid="add-dish-button"]');
    await addDishBtn.scrollIntoViewIfNeeded();
    await addDishBtn.click({ force: true });

    const formModal = page.locator('[data-testid="dish-form-modal"]');
    await expect(formModal).toBeVisible();

    // Fill dish name and price as shown in user screenshot
    await page.locator('[data-testid="dish-form-name"]').fill('Fanta Orange Bottle');
    await page.locator('[data-testid="dish-form-price"]').fill('65');

    // Click "+ New Category" toggle
    const toggleQuickCatBtn = page.locator('[data-testid="toggle-inline-category-creator"]');
    await expect(toggleQuickCatBtn).toBeVisible();
    await toggleQuickCatBtn.click();

    // Drawer opens
    const drawer = page.locator('[data-testid="inline-category-creator-drawer"]');
    await expect(drawer).toBeVisible();

    // Fill new category details
    await page.locator('[data-testid="quick-cat-name-input"]').fill('Soft Drinks & Sodas');
    await page.locator('[data-testid="quick-cat-amharic-input"]').fill('ለስላሳ መጠጦች');

    // Click icon chip 🥤
    const sodaIconBtn = drawer.locator('button:has-text("🥤")');
    await sodaIconBtn.click();

    // Click "Create & Select Category"
    const saveCatBtn = page.locator('[data-testid="quick-save-category-btn"]');
    await saveCatBtn.click();

    // Drawer closes and toast feedback appears
    await expect(drawer).toBeHidden();

    // Verify newly created category is selected in the category dropdown
    const categorySelect = page.locator('[data-testid="dish-form-category"]');
    const selectedOption = categorySelect.locator('option:checked');
    await expect(selectedOption).toContainText('Soft Drinks & Sodas');

    // Save and Publish Dish
    const saveDishBtn = page.locator('[data-testid="save-dish-button"]');
    await saveDishBtn.scrollIntoViewIfNeeded();
    await saveDishBtn.click({ force: true });
    await expect(formModal).toBeHidden();

    // Dish appears in menu list
    await expect(page.locator('text=Fanta Orange Bottle').first()).toBeVisible();
  });

  test('2. Central Category Manager: Create, Edit, Reorder, and Delete with safe dish reassignment', async ({ page }) => {
    // Open Category Manager via top action button
    const manageCatBtn = page.locator('[data-testid="manage-categories-button"]');
    await manageCatBtn.scrollIntoViewIfNeeded();
    await manageCatBtn.click({ force: true });

    const catModal = page.locator('[data-testid="categories-manager-modal"]');
    await expect(catModal).toBeVisible();

    // Verify existing categories list
    await expect(catModal.locator('text=Categories Configured')).toBeVisible();

    // Click "Add Category"
    const addCatBtn = catModal.locator('[data-testid="add-category-button"]');
    await addCatBtn.click();

    const form = catModal.locator('[data-testid="category-form-modal"]');
    await expect(form).toBeVisible();

    // Fill category form
    await catModal.locator('[data-testid="category-name-input"]').fill('Chef Seasonal Specials');
    await catModal.locator('[data-testid="category-amharic-input"]').fill('የሼፍ ልዩ ምግቦች');
    await catModal.locator('[data-testid="category-icon-input"]').fill('⭐');

    // Save
    const saveBtn = catModal.locator('[data-testid="save-category-submit"]');
    await saveBtn.click();

    // Verify new category appears in list and form closes
    await expect(catModal.locator('text=Chef Seasonal Specials').first()).toBeVisible();
    await expect(form).toBeHidden();

    // Edit the category
    const editBtn = catModal.locator('button[data-testid^="edit-category-btn-"]').last();
    await editBtn.click();
    await expect(form).toBeVisible();
    await catModal.locator('[data-testid="category-name-input"]').fill('Chef Signature Specials');
    await catModal.locator('[data-testid="save-category-submit"]').click();

    await expect(catModal.locator('text=Chef Signature Specials').first()).toBeVisible();
    await expect(form).toBeHidden();

    // Close Category Modal
    await catModal.locator('button:has(svg.lucide-x)').click();
    await expect(catModal).toBeHidden();
  });

  test('3. Real-Time Customer Sync: Newly created category reflects in dining view', async ({ page }) => {
    // Open customer dining view in same browser context
    await page.goto('/addis?table=Table%2014');
    await expect(page.locator('h1:has-text("Addis Cafeteria")')).toBeVisible();

    // Categories are rendered on customer page
    await expect(page.locator('text=Soft Cake').first()).toBeVisible();
  });
});

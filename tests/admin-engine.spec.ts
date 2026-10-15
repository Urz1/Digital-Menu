import { test, expect } from '@playwright/test';
import {
  checkWcagContrast,
  applyBulkPriceChange,
  classifyMenuMatrix,
  exportMenuToCsv,
  parseMenuFromCsv,
  isScheduledMenuActive,
} from '../src/lib/admin-engine';
import { MenuItem, Category, ScheduledMenu } from '../src/types/database';

test.describe('Stage 5: Admin Engine - Pure Unit Tests', () => {
  test('1. WCAG 2.2 AA Contrast Checker: Calculates contrast ratio and warns if below 4.5:1', () => {
    // High contrast: Black on White (~21:1) -> Passes AA
    const highContrast = checkWcagContrast('#000000', '#FFFFFF');
    expect(highContrast.passesAA).toBe(true);
    expect(highContrast.ratio).toBeGreaterThanOrEqual(15);
    expect(highContrast.warning).toBeUndefined();

    // Low contrast: Light gray on White (~1.6:1) -> Fails AA
    const lowContrast = checkWcagContrast('#CCCCCC', '#FFFFFF');
    expect(lowContrast.passesAA).toBe(false);
    expect(lowContrast.ratio).toBeLessThan(4.5);
    expect(lowContrast.warning).toContain('below the WCAG AA standard');

    // Brand orange (#E8590C) on dark background (#121318)
    const brandContrast = checkWcagContrast('#E8590C', '#121318');
    expect(brandContrast.ratio).toBeGreaterThan(0);
  });

  test('2. Bulk Price Math: Correctly updates selected items by % or fixed amount', () => {
    const items: MenuItem[] = [
      {
        id: 'i-1',
        restaurant_id: 'rest-1',
        category_id: 'cat-1',
        name: 'Item 1',
        description: 'Test dish 1',
        price: 20.0,
        image_url: '',
        tags: [],
        allergens: [],
        spice_level: 0,
        is_available: true,
        is_chefs_pick: false,
        sort_order: 1,
      },
      {
        id: 'i-2',
        restaurant_id: 'rest-1',
        category_id: 'cat-1',
        name: 'Item 2',
        description: 'Test dish 2',
        price: 15.0,
        image_url: '',
        tags: [],
        allergens: [],
        spice_level: 0,
        is_available: true,
        is_chefs_pick: false,
        sort_order: 2,
      },
      {
        id: 'i-3',
        restaurant_id: 'rest-1',
        category_id: 'cat-1',
        name: 'Item 3 (Unselected)',
        description: 'Test dish 3',
        price: 10.0,
        image_url: '',
        tags: [],
        allergens: [],
        spice_level: 0,
        is_available: true,
        is_chefs_pick: false,
        sort_order: 3,
      },
    ];

    // +10% on i-1 and i-2
    const updatedPercent = applyBulkPriceChange(items, ['i-1', 'i-2'], 'percent', 10);
    expect(updatedPercent.find((i) => i.id === 'i-1')?.price).toBe(22.0); // 20 * 1.10
    expect(updatedPercent.find((i) => i.id === 'i-2')?.price).toBe(16.5); // 15 * 1.10
    expect(updatedPercent.find((i) => i.id === 'i-3')?.price).toBe(10.0); // Unchanged

    // +$2.50 fixed amount on i-1
    const updatedFixed = applyBulkPriceChange(items, ['i-1'], 'amount', 2.5);
    expect(updatedFixed.find((i) => i.id === 'i-1')?.price).toBe(22.5);
  });

  test('3. Menu Matrix Insights: Categorizes Stars, Workhorses, Hidden Gems, and Underperformers', () => {
    const items: MenuItem[] = [
      {
        id: 'i-star',
        restaurant_id: 'rest-1',
        category_id: 'cat-1',
        name: 'Truffle Burrata',
        description: 'Star dish',
        price: 18.0,
        image_url: '',
        tags: [],
        allergens: [],
        spice_level: 0,
        is_available: true,
        is_chefs_pick: false,
        sort_order: 1,
      },
      {
        id: 'i-gem',
        restaurant_id: 'rest-1',
        category_id: 'cat-1',
        name: 'Wagyu Carpaccio',
        description: 'Gem dish',
        price: 22.0,
        image_url: '',
        tags: [],
        allergens: [],
        spice_level: 0,
        is_available: true,
        is_chefs_pick: false,
        sort_order: 2,
      },
    ];

    const viewsMap = { 'i-star': 240, 'i-gem': 45 };
    const ordersMap = { 'i-star': 35, 'i-gem': 6 };
    const ratingMap = { 'i-star': 4.7, 'i-gem': 4.9 };

    const matrix = classifyMenuMatrix(items, viewsMap, ordersMap, ratingMap);
    
    const star = matrix.find((m) => m.item_id === 'i-star');
    expect(star?.classification).toBe('star');
    expect(star?.suggestion).toContain('Keep front and center');

    const gem = matrix.find((m) => m.item_id === 'i-gem');
    expect(gem?.classification).toBe('hidden_gem');
    expect(gem?.suggestion).toContain('Move up in category order');
  });

  test('4. CSV Export & Import: Exports menu to CSV and parses valid CSV back to dishes', () => {
    const items: MenuItem[] = [
      {
        id: 'csv-1',
        restaurant_id: 'rest-1',
        category_id: 'cat-1',
        name: 'Artisan Sourdough',
        price: 16.5,
        image_url: '',
        tags: ['vegetarian'],
        allergens: ['Gluten'],
        spice_level: 0,
        is_available: true,
        is_chefs_pick: true,
        sort_order: 1,
        description: 'Naturally leavened loaf',
      },
    ];

    const categories: Category[] = [
      {
        id: 'cat-1',
        restaurant_id: 'rest-1',
        name: 'Bakery',
        icon: '🥖',
        description: 'Fresh bakes',
        sort_order: 1,
        is_active: true,
      },
    ];

    const csvOutput = exportMenuToCsv(items, categories);
    expect(csvOutput).toContain('Artisan Sourdough');
    expect(csvOutput).toContain('16.50');
    expect(csvOutput).toContain('Bakery');

    const parsed = parseMenuFromCsv(csvOutput, 'rest-1', 'cat-1');
    expect(parsed.success).toBe(true);
    expect(parsed.items.length).toBe(1);
    expect(parsed.items[0].name).toBe('Artisan Sourdough');
    expect(parsed.items[0].price).toBe(16.5);
  });

  test('5. Scheduled Menus: Evaluates active time windows', () => {
    const lunchMenu: ScheduledMenu = {
      id: 'sched-1',
      restaurant_id: 'rest-1',
      name: 'Lunch Special',
      start_time: '11:00',
      end_time: '15:00',
      days_of_week: [1, 2, 3, 4, 5],
      category_ids: ['cat-1'],
      is_active: true,
    };

    // 12:30 PM UTC
    const inWindow = new Date('2026-10-15T12:30:00Z');
    expect(isScheduledMenuActive(lunchMenu, inWindow, 'UTC')).toBe(true);

    // 18:00 (6:00 PM) UTC -> Out of window
    const outOfWindow = new Date('2026-10-15T18:00:00Z');
    expect(isScheduledMenuActive(lunchMenu, outOfWindow, 'UTC')).toBe(false);
  });
});

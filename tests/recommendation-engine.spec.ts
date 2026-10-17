import { test, expect } from '@playwright/test';
import { getIntelligentPairings } from '../src/lib/recommendation-engine';
import { MenuItem } from '../src/types/database';

test.describe('Intelligent Recommendation Engine - Research & Cultural Rules', () => {
  const items: MenuItem[] = [
    { id: 'item-beyaynetu', restaurant_id: 'res-1', category_id: 'cat-fasting', name: 'Yetsom Beyaynetu', price: 250, description: 'Traditional vegan platter', image_url: '', tags: ['fasting', 'vegan'], allergens: [], spice_level: 1, is_available: true, is_chefs_pick: true, sort_order: 1 },
    { id: 'item-yebeg-tibs', restaurant_id: 'res-1', category_id: 'cat-lunch-dinner', name: 'Yebeg Tibs', price: 450, description: 'Sizzling lamb tibs', image_url: '', tags: ['meat'], allergens: ['Meat'], spice_level: 2, is_available: true, is_chefs_pick: true, sort_order: 2 },
    { id: 'item-special-mendi', restaurant_id: 'res-1', category_id: 'cat-mendi', name: 'Special Mendi', price: 650, description: 'Slow-roasted rice and meat', image_url: '', tags: ['meat'], allergens: ['Meat'], spice_level: 1, is_available: true, is_chefs_pick: true, sort_order: 3 },
    { id: 'item-special-burger', restaurant_id: 'res-1', category_id: 'cat-burgers', name: 'Special Burger', price: 350, description: 'Juicy beef burger', image_url: '', tags: ['meat'], allergens: ['Meat', 'Gluten'], spice_level: 0, is_available: true, is_chefs_pick: true, sort_order: 4 },
    { id: 'item-coffee-buna', restaurant_id: 'res-1', category_id: 'cat-hot-beverage', name: 'Traditional Buna', price: 50, description: 'Single origin highland coffee', image_url: '', tags: ['beverage'], allergens: [], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 5 },
    { id: 'item-ambo-water', restaurant_id: 'res-1', category_id: 'cat-cold-drinks', name: 'Ambo Water', price: 40, description: 'Sparkling mineral water', image_url: '', tags: ['beverage', 'fasting'], allergens: [], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 6 },
    { id: 'item-macchiato', restaurant_id: 'res-1', category_id: 'cat-hot-drinks', name: 'Macchiato', price: 60, description: 'Highland espresso with milk foam', image_url: '', tags: ['beverage'], allergens: ['Dairy'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 7 },
    { id: 'item-somali-tea', restaurant_id: 'res-1', category_id: 'cat-hot-drinks', name: 'Somali Shaah', price: 45, description: 'Spiced aromatic tea', image_url: '', tags: ['beverage', 'fasting'], allergens: [], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 8 },
    { id: 'item-french-fries', restaurant_id: 'res-1', category_id: 'cat-snacks', name: 'French Fries', price: 120, description: 'Crispy golden fries', image_url: '', tags: ['snack', 'vegetarian', 'fasting'], allergens: [], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 9 },
    { id: 'item-croissant', restaurant_id: 'res-1', category_id: 'cat-soft-cake', name: 'Croissant Plain', price: 150, description: 'Flaky butter croissant', image_url: '', tags: ['bakery'], allergens: ['Dairy', 'Gluten'], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 10 },
    { id: 'item-spris', restaurant_id: 'res-1', category_id: 'cat-juice', name: 'Spris Juice', price: 140, description: 'Layered fresh juice', image_url: '', tags: ['juice', 'fasting'], allergens: [], spice_level: 0, is_available: true, is_chefs_pick: false, sort_order: 11 },
  ];

  test('1. Fasting Isolation Rule: Fasting dish NEVER recommends meat or dairy', () => {
    const beyaynetu = items.find((i) => i.id === 'item-beyaynetu')!;
    expect(beyaynetu).toBeDefined();

    const pairings = getIntelligentPairings(beyaynetu, items);
    expect(pairings.length).toBeGreaterThan(0);

    for (const p of pairings) {
      // Must not have dairy or egg
      expect(p.item.allergens).not.toContain('Dairy');
      expect(p.item.allergens).not.toContain('Egg');
      expect(p.item.allergens).not.toContain('Meat');
      expect(p.item.allergens).not.toContain('Seafood');
      // Must be tagged fasting or vegan
      const isFastingSafe =
        p.item.tags.includes('fasting') ||
        p.item.tags.includes('vegan') ||
        p.item.category_id === 'cat-fasting' ||
        p.item.category_id === 'cat-juices' ||
        p.item.id === 'item-coffee-buna' ||
        p.item.id === 'item-ambo-water';
      expect(isFastingSafe).toBe(true);
    }
  });

  test('2. Sizzling Meat / Tibs Rule: Recommends Ambo Water & Ethiopian Buna/Macchiato', () => {
    const tibs = items.find((i) => i.id === 'item-yebeg-tibs')!;
    expect(tibs).toBeDefined();

    const pairings = getIntelligentPairings(tibs, items);
    expect(pairings.length).toBe(3);

    const ids = pairings.map((p) => p.item.id);
    // Should contain Ambo water or Macchiato
    expect(ids).toContain('item-ambo-water');
    expect(ids).toContain('item-macchiato');

    // Intent badge should be informative
    const amboPairing = pairings.find((p) => p.item.id === 'item-ambo-water')!;
    expect(amboPairing.intentBadge).toBe('Palate Cleanser');
  });

  test('3. Mendi & Roasts Rule: Recommends Somali Tea (Shaah) & Spris', () => {
    const mendi = items.find((i) => i.id === 'item-special-mendi')!;
    expect(mendi).toBeDefined();

    const pairings = getIntelligentPairings(mendi, items);
    const ids = pairings.map((p) => p.item.id);
    expect(ids).toContain('item-somali-tea');

    const teaPairing = pairings.find((p) => p.item.id === 'item-somali-tea')!;
    expect(teaPairing.intentBadge).toBe('Authentic Digestif');
  });

  test('4. Burger Rule: Recommends French Fries as #1 Cross-Sell', () => {
    const burger = items.find((i) => i.id === 'item-special-burger')!;
    expect(burger).toBeDefined();

    const pairings = getIntelligentPairings(burger, items);
    expect(pairings[0].item.id).toBe('item-french-fries');
    expect(pairings[0].intentBadge).toBe('Classic Combo');
  });

  test('5. Coffee Rule: Recommends Croissant / Bakery treat', () => {
    const buna = items.find((i) => i.id === 'item-coffee-buna')!;
    expect(buna).toBeDefined();

    const pairings = getIntelligentPairings(buna, items);
    const ids = pairings.map((p) => p.item.id);
    expect(ids).toContain('item-croissant');
  });
});

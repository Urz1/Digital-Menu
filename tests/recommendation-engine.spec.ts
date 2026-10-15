import { test, expect } from '@playwright/test';
import { getIntelligentPairings } from '../src/lib/recommendation-engine';
import { MOCK_ITEMS_ADDIS } from '../src/lib/data-provider';

test.describe('Intelligent Recommendation Engine - Research & Cultural Rules', () => {
  const items = MOCK_ITEMS_ADDIS;

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

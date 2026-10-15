import { test, expect } from '@playwright/test';
import {
  evaluateOfferSchedule,
  evaluateItemPricing,
  evaluateCartPricing,
  detectOfferConflicts,
  PricingContext,
} from '../src/lib/pricing-engine';
import { MenuItem, Offer } from '../src/types/database';
import { CartItem } from '../src/types/menu';

const sampleItem1: MenuItem = {
  id: 'item-burger',
  restaurant_id: 'rest-addis',
  category_id: 'cat-woodfired',
  name: 'Artisan Sourdough Burger',
  description: 'Wagyu smash patty with aged cheddar on fermented sourdough bun.',
  price: 15.0,
  image_url: 'https://example.com/burger.jpg',
  tags: ['halal'],
  allergens: ['gluten', 'dairy'],
  spice_level: 1,
  is_available: true,
  is_chefs_pick: true,
  sort_order: 1,
};

const sampleItem2: MenuItem = {
  id: 'item-coffee',
  restaurant_id: 'rest-addis',
  category_id: 'cat-drinks',
  name: 'Yirgacheffe Single-Origin Espresso',
  description: 'Bright citrus and floral notes with a honey-glazed crema.',
  price: 5.0,
  image_url: 'https://example.com/coffee.jpg',
  tags: ['vegan'],
  allergens: [],
  spice_level: 0,
  is_available: true,
  is_chefs_pick: false,
  sort_order: 2,
};

const sampleItem3: MenuItem = {
  id: 'item-pastry',
  restaurant_id: 'rest-addis',
  category_id: 'cat-desserts',
  name: 'Honey Pistachio Baklava Tart',
  description: 'Layers of crispy phyllo, roasted pistachios, and wildflower honey syrup.',
  price: 8.0,
  image_url: 'https://example.com/baklava.jpg',
  tags: ['vegetarian'],
  allergens: ['nuts', 'gluten'],
  spice_level: 0,
  is_available: true,
  is_chefs_pick: false,
  sort_order: 3,
};

test.describe('Pricing Engine - Pure Unit Tests', () => {
  test('1. Percentage Off Offer applies correctly', () => {
    const offer: Offer = {
      id: 'offer-pct',
      restaurant_id: 'rest-addis',
      title: '20% Off All Items',
      badge_text: '20% Off',
      template_type: 'percentage_off',
      status: 'live',
      is_paused: false,
      discount_type: 'percentage',
      discount_value: 20,
      scope_type: 'all',
      timezone: 'UTC',
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = evaluateItemPricing(sampleItem1, [offer], {
      currentTime: new Date('2026-10-14T12:00:00Z'),
      timezone: 'UTC',
    });

    expect(result.hasOffer).toBe(true);
    expect(result.originalPrice).toBe(15.0);
    expect(result.savings).toBe(3.0);
    expect(result.finalPrice).toBe(12.0);
    expect(result.appliedOffer?.id).toBe('offer-pct');
  });

  test('2. Fixed Money Off Offer applies correctly', () => {
    const offer: Offer = {
      id: 'offer-fixed',
      restaurant_id: 'rest-addis',
      title: '$4 Off Burger',
      badge_text: 'Save $4',
      template_type: 'money_off',
      status: 'live',
      is_paused: false,
      discount_type: 'fixed_amount',
      discount_value: 4.0,
      scope_type: 'items',
      item_ids: ['item-burger'],
      timezone: 'UTC',
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = evaluateItemPricing(sampleItem1, [offer], {
      currentTime: new Date('2026-10-14T12:00:00Z'),
      timezone: 'UTC',
    });

    expect(result.hasOffer).toBe(true);
    expect(result.originalPrice).toBe(15.0);
    expect(result.savings).toBe(4.0);
    expect(result.finalPrice).toBe(11.0);
  });

  test('3. Happy Hour: Evaluates daily time window & day of week in restaurant timezone', () => {
    // Happy hour: 15:00 to 18:00 Addis Ababa time (UTC+3) on weekdays (Mon-Fri = 1..5)
    const happyHourOffer: Offer = {
      id: 'offer-hh',
      restaurant_id: 'rest-addis',
      title: 'Afternoon Happy Hour 25% Off',
      badge_text: 'Happy Hour',
      template_type: 'happy_hour',
      status: 'live',
      is_paused: false,
      discount_type: 'percentage',
      discount_value: 25,
      scope_type: 'all',
      timezone: 'Africa/Addis_Ababa',
      days_of_week: [1, 2, 3, 4, 5], // Mon to Fri
      start_time: '15:00',
      end_time: '18:00',
      honest_urgency_hours: 2,
      show_top_banner: true,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // 2026-10-14 is a Wednesday.
    // 13:00 UTC = 16:00 in Africa/Addis_Ababa (UTC+3) -> Inside 15:00 - 18:00
    const timeDuringHappyHour = new Date('2026-10-14T13:00:00Z');
    const statusDuring = evaluateOfferSchedule(happyHourOffer, timeDuringHappyHour, 'Africa/Addis_Ababa');
    expect(statusDuring.isActive).toBe(true);

    // Pricing during happy hour
    const pricingDuring = evaluateItemPricing(sampleItem1, [happyHourOffer], {
      currentTime: timeDuringHappyHour,
      timezone: 'Africa/Addis_Ababa',
    });
    expect(pricingDuring.hasOffer).toBe(true);
    expect(pricingDuring.savings).toBe(3.75); // 25% of 15.00
    expect(pricingDuring.finalPrice).toBe(11.25);

    // 10:00 UTC = 13:00 in Africa/Addis_Ababa -> Before 15:00
    const timeBeforeHappyHour = new Date('2026-10-14T10:00:00Z');
    const statusBefore = evaluateOfferSchedule(happyHourOffer, timeBeforeHappyHour, 'Africa/Addis_Ababa');
    expect(statusBefore.isActive).toBe(false);
    expect(statusBefore.reason).toBe('outside_hours');

    // 16:00 UTC = 19:00 in Africa/Addis_Ababa -> After 18:00
    const timeAfterHappyHour = new Date('2026-10-14T16:00:00Z');
    const statusAfter = evaluateOfferSchedule(happyHourOffer, timeAfterHappyHour, 'Africa/Addis_Ababa');
    expect(statusAfter.isActive).toBe(false);
    expect(statusAfter.reason).toBe('outside_hours');

    // 2026-10-18 is Sunday (day 0) -> wrong day
    const timeOnSunday = new Date('2026-10-18T13:00:00Z');
    const statusSunday = evaluateOfferSchedule(happyHourOffer, timeOnSunday, 'Africa/Addis_Ababa');
    expect(statusSunday.isActive).toBe(false);
    expect(statusSunday.reason).toBe('wrong_day');
  });

  test('4. Automatic Expiry & Paused state', () => {
    const expiredOffer: Offer = {
      id: 'offer-exp',
      restaurant_id: 'rest-addis',
      title: 'Yesterday Special',
      badge_text: 'Expired',
      template_type: 'todays_special',
      status: 'live',
      is_paused: false,
      discount_type: 'fixed_amount',
      discount_value: 5,
      scope_type: 'all',
      timezone: 'UTC',
      ends_at: '2026-10-13T23:59:59Z', // Ended yesterday
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const statusExpired = evaluateOfferSchedule(expiredOffer, new Date('2026-10-14T12:00:00Z'), 'UTC');
    expect(statusExpired.isActive).toBe(false);
    expect(statusExpired.reason).toBe('expired');

    // Paused offer
    const pausedOffer = { ...expiredOffer, ends_at: null, is_paused: true };
    const statusPaused = evaluateOfferSchedule(pausedOffer, new Date('2026-10-14T12:00:00Z'), 'UTC');
    expect(statusPaused.isActive).toBe(false);
    expect(statusPaused.reason).toBe('paused');
  });

  test('5. Overlapping Offers Conflict: Best discount wins by default', () => {
    const offer20Pct: Offer = {
      id: 'offer-20',
      restaurant_id: 'rest-addis',
      title: '20% Off',
      badge_text: '20% Off',
      template_type: 'percentage_off',
      status: 'live',
      is_paused: false,
      discount_type: 'percentage',
      discount_value: 20, // saves $3 on a $15 burger
      scope_type: 'all',
      timezone: 'UTC',
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const offer5Fixed: Offer = {
      id: 'offer-5',
      restaurant_id: 'rest-addis',
      title: '$5 Off',
      badge_text: 'Save $5',
      template_type: 'money_off',
      status: 'live',
      is_paused: false,
      discount_type: 'fixed_amount',
      discount_value: 5, // saves $5 on a $15 burger
      scope_type: 'all',
      timezone: 'UTC',
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // For item1 ($15): $5 saving is better than $3 (20%) -> offer5Fixed must win!
    const resultItem1 = evaluateItemPricing(sampleItem1, [offer20Pct, offer5Fixed], {
      currentTime: new Date('2026-10-14T12:00:00Z'),
      timezone: 'UTC',
    });
    expect(resultItem1.appliedOffer?.id).toBe('offer-5');
    expect(resultItem1.savings).toBe(5.0);
    expect(resultItem1.finalPrice).toBe(10.0);

    // For item2 ($5): $5 fixed would make it free ($5 savings), 20% is $1 savings -> offer-5 wins
    // What if fixed was $0.50? Then 20% ($1.00) would win!
    const smallFixed = { ...offer5Fixed, discount_value: 0.5 };
    const resultItem2 = evaluateItemPricing(sampleItem2, [offer20Pct, smallFixed], {
      currentTime: new Date('2026-10-14T12:00:00Z'),
      timezone: 'UTC',
    });
    expect(resultItem2.appliedOffer?.id).toBe('offer-20');
    expect(resultItem2.savings).toBe(1.0);
    expect(resultItem2.finalPrice).toBe(4.0);
  });

  test('6. Honest Urgency: Shows time remaining ONLY when genuinely ending within threshold', () => {
    const offerEndingIn30Mins: Offer = {
      id: 'offer-urgency',
      restaurant_id: 'rest-addis',
      title: 'Flash Special',
      badge_text: 'Flash',
      template_type: 'limited_time',
      status: 'live',
      is_paused: false,
      discount_type: 'fixed_amount',
      discount_value: 3,
      scope_type: 'all',
      timezone: 'UTC',
      ends_at: '2026-10-14T12:30:00Z',
      honest_urgency_hours: 2, // urgency trigger if within 2 hours
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Current time: 12:00:00Z -> exactly 30 mins left
    const statusAt12 = evaluateOfferSchedule(offerEndingIn30Mins, new Date('2026-10-14T12:00:00Z'), 'UTC');
    expect(statusAt12.isActive).toBe(true);
    expect(statusAt12.isEndingSoon).toBe(true);
    expect(statusAt12.urgencyText).toBe('Ends in 30m');

    // Current time: 08:00:00Z -> 4.5 hours left -> more than 2 hours, NO urgency text
    const statusAt8 = evaluateOfferSchedule(offerEndingIn30Mins, new Date('2026-10-14T08:00:00Z'), 'UTC');
    expect(statusAt8.isActive).toBe(true);
    expect(statusAt8.isEndingSoon).toBe(false);
    expect(statusAt8.urgencyText).toBeUndefined();
  });

  test('7. Cart Pricing line-by-line and free gift with order over $X', () => {
    const burgerOffer: Offer = {
      id: 'offer-burger',
      restaurant_id: 'rest-addis',
      title: 'Save $3 on Burger',
      badge_text: 'Save $3',
      template_type: 'money_off',
      status: 'live',
      is_paused: false,
      discount_type: 'fixed_amount',
      discount_value: 3,
      scope_type: 'items',
      item_ids: ['item-burger'],
      timezone: 'UTC',
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const freeGiftOffer: Offer = {
      id: 'offer-gift',
      restaurant_id: 'rest-addis',
      title: 'Free Baklava on Orders Over $25',
      badge_text: 'Free Gift',
      template_type: 'free_item',
      status: 'live',
      is_paused: false,
      discount_type: 'free_item',
      discount_value: 0,
      min_order_amount: 25.0,
      free_item_id: 'item-pastry',
      scope_type: 'all',
      timezone: 'UTC',
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'allow_stack',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const cart: CartItem[] = [
      {
        cartId: 'c1',
        item: sampleItem1, // Burger $15 -> $12
        quantity: 2,
        options: [],
        unitPrice: 15.0,
      },
      {
        cartId: 'c2',
        item: sampleItem2, // Espresso $5
        quantity: 1,
        options: [],
        unitPrice: 5.0,
      },
    ];

    const itemsMap = new Map<string, MenuItem>([
      [sampleItem1.id, sampleItem1],
      [sampleItem2.id, sampleItem2],
      [sampleItem3.id, sampleItem3],
    ]);

    const cartResult = evaluateCartPricing(
      cart,
      [burgerOffer, freeGiftOffer],
      0.1, // 10% tax
      {
        currentTime: new Date('2026-10-14T12:00:00Z'),
        timezone: 'UTC',
        menuItemsMap: itemsMap,
      }
    );

    // 2 burgers ($30 original) -> save $6 ($24 net)
    // 1 espresso ($5 original) -> $5 net
    // Subtotal net = $29 -> >= $25 threshold, so free baklava awarded!
    expect(cartResult.originalSubtotal).toBe(35.0);
    expect(cartResult.netSubtotal).toBe(29.0);
    expect(cartResult.totalSavings).toBe(6.0);
    expect(cartResult.tax).toBe(2.9);
    expect(cartResult.total).toBe(31.9);
    expect(cartResult.freeItemAwarded).toBeDefined();
    expect(cartResult.freeItemAwarded?.item.id).toBe('item-pastry');
  });

  test('8. Admin Conflict Detector detects overlapping dishes with clear message', () => {
    const offerA: Offer = {
      id: 'offer-a',
      restaurant_id: 'rest-addis',
      title: 'Happy Hour 20%',
      badge_text: '20% Off',
      template_type: 'happy_hour',
      status: 'live',
      is_paused: false,
      discount_type: 'percentage',
      discount_value: 20,
      scope_type: 'categories',
      category_ids: ['cat-woodfired'],
      timezone: 'UTC',
      days_of_week: [1, 2, 3],
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const offerB: Offer = {
      id: 'offer-b',
      restaurant_id: 'rest-addis',
      title: 'Burger Special $3 Off',
      badge_text: 'Save $3',
      template_type: 'todays_special',
      status: 'live',
      is_paused: false,
      discount_type: 'fixed_amount',
      discount_value: 3,
      scope_type: 'items',
      item_ids: ['item-burger'], // same item
      timezone: 'UTC',
      days_of_week: [2, 3, 4], // Tuesday, Wednesday overlap
      honest_urgency_hours: 2,
      show_top_banner: false,
      stacking_rule: 'best_discount',
      priority: 1,
      views_count: 0,
      taps_count: 0,
      orders_count: 0,
      total_savings: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const allItems = [sampleItem1, sampleItem2, sampleItem3];
    const conflicts = detectOfferConflicts([offerA, offerB], allItems);

    expect(conflicts.length).toBe(1);
    expect(conflicts[0].overlappingItemNames).toContain('Artisan Sourdough Burger');
    expect(conflicts[0].warningMessage).toContain('These two offers overlap on Artisan Sourdough Burger');
  });
});

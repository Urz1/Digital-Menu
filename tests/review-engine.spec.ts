import { test, expect } from '@playwright/test';
import {
  checkReviewContent,
  validateBotCheck,
  checkReviewRateLimit,
  validateReviewPhoto,
  calculateDishReviewStats,
  canReplyToReview,
  canRemoveReview,
  generateWeeklyReviewSummary,
} from '../src/lib/review-engine';
import { DishReview } from '../src/types/database';

test.describe('Stage 4: Dish Reviews Engine - Pure Unit Tests', () => {
  const dummyRestaurantId = 'rest-123';
  const dummyItemId = 'item-pizza-1';

  test('1. Rate Limiting & Duplicate Prevention: Prevents multiple reviews for the same dish in the same session', () => {
    const existingReviews: DishReview[] = [
      {
        id: 'rev-1',
        restaurant_id: dummyRestaurantId,
        item_id: dummyItemId,
        rating: 5,
        tags: ['Great portion'],
        session_token: 'session-guest-abc',
        status: 'published',
        report_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    // Same session, same item -> Blocked
    const duplicateCheck = checkReviewRateLimit(
      existingReviews,
      'session-guest-abc',
      dummyItemId
    );
    expect(duplicateCheck.allowed).toBe(false);
    expect(duplicateCheck.error).toContain('already reviewed this dish');

    // Different item -> Allowed
    const differentItemCheck = checkReviewRateLimit(
      existingReviews,
      'session-guest-abc',
      'item-burger-2'
    );
    expect(differentItemCheck.allowed).toBe(true);

    // Different session -> Allowed
    const differentSessionCheck = checkReviewRateLimit(
      existingReviews,
      'session-guest-xyz',
      dummyItemId
    );
    expect(differentSessionCheck.allowed).toBe(true);
  });

  test('2. Rate Limiting Velocity: Enforces max 5 reviews within 10-minute sliding window', () => {
    const now = new Date('2026-10-14T20:00:00Z');
    const existingReviews: DishReview[] = [1, 2, 3, 4, 5].map((i) => ({
      id: `rev-${i}`,
      restaurant_id: dummyRestaurantId,
      item_id: `item-${i}`,
      rating: 5,
      tags: [],
      session_token: 'session-power-reviewer',
      status: 'published',
      report_count: 0,
      created_at: new Date('2026-10-14T19:55:00Z').toISOString(), // 5 mins ago
      updated_at: new Date('2026-10-14T19:55:00Z').toISOString(),
    }));

    // 6th review within 10 minutes -> Blocked
    const velocityCheck = checkReviewRateLimit(
      existingReviews,
      'session-power-reviewer',
      'item-6',
      now
    );
    expect(velocityCheck.allowed).toBe(false);
    expect(velocityCheck.error).toContain('Review limit reached');
  });

  test('3. 3-Review Threshold: Average rating and count appear ONLY when dish has >= 3 reviews', () => {
    // Case A: 0 reviews
    const stats0 = calculateDishReviewStats([], 'item-new', 3);
    expect(stats0.is_threshold_met).toBe(false);
    expect(stats0.review_count).toBe(0);

    // Case B: 2 reviews (< 3 threshold)
    const reviews2: DishReview[] = [
      {
        id: 'r1',
        restaurant_id: dummyRestaurantId,
        item_id: 'item-burger',
        rating: 5,
        tags: [],
        session_token: 's1',
        status: 'published',
        report_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r2',
        restaurant_id: dummyRestaurantId,
        item_id: 'item-burger',
        rating: 4,
        tags: [],
        session_token: 's2',
        status: 'published',
        report_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    const stats2 = calculateDishReviewStats(reviews2, 'item-burger', 3);
    expect(stats2.is_threshold_met).toBe(false);
    expect(stats2.review_count).toBe(2);

    // Case C: 3 reviews (>= 3 threshold met!)
    const reviews3: DishReview[] = [
      ...reviews2,
      {
        id: 'r3',
        restaurant_id: dummyRestaurantId,
        item_id: 'item-burger',
        rating: 5,
        tags: ['Great portion'],
        session_token: 's3',
        status: 'published',
        report_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    const stats3 = calculateDishReviewStats(reviews3, 'item-burger', 3);
    expect(stats3.is_threshold_met).toBe(true);
    expect(stats3.review_count).toBe(3);
    expect(stats3.average_rating).toBe(4.7); // (5+4+5)/3 = 4.666 -> 4.7
  });

  test('4. Fairness Rules: Genuine negative reviews are NOT flagged; only profanity and PII are flagged', () => {
    // Genuine negative review: MUST BE CLEAN
    const negativeReview = checkReviewContent(
      'The steak was completely cold and tough to chew. Slow service today.',
      ['Too salty']
    );
    expect(negativeReview.isClean).toBe(true);
    expect(negativeReview.flaggedReason).toBe('clean');

    // Abusive profanity: FLAGGED
    const abusiveReview = checkReviewContent(
      'The waiter was a total bitch and idiot',
      []
    );
    expect(abusiveReview.isClean).toBe(false);
    expect(abusiveReview.flaggedReason).toBe('profanity');

    // Personal contact information (PII): FLAGGED
    const piiReview = checkReviewContent(
      'Call the server directly at 555-234-5678 or john@example.com',
      []
    );
    expect(piiReview.isClean).toBe(false);
    expect(piiReview.flaggedReason).toBe('personal_data');
  });

  test('5. Photo Validation: Validates image MIME type and 4MB size ceiling', () => {
    // Valid JPG, 2MB
    const validJpg = validateReviewPhoto({ type: 'image/jpeg', size: 2 * 1024 * 1024 });
    expect(validJpg.isValid).toBe(true);

    // Valid PNG, 1MB
    const validPng = validateReviewPhoto({ type: 'image/png', size: 1024 * 1024 });
    expect(validPng.isValid).toBe(true);

    // Invalid format (e.g. PDF or executable)
    const invalidType = validateReviewPhoto({ type: 'application/pdf', size: 50000 });
    expect(invalidType.isValid).toBe(false);
    expect(invalidType.error).toContain('Invalid photo format');

    // Too large (> 4MB)
    const tooLarge = validateReviewPhoto({ type: 'image/jpeg', size: 5 * 1024 * 1024 });
    expect(tooLarge.isValid).toBe(false);
    expect(tooLarge.error).toContain('Photo is too large');
  });

  test('6. Bot & Honeypot Check: Detects bot filled honeypots and inhuman submission speeds', () => {
    // Human filling form: empty honeypot, took 4.5 seconds
    const humanCheck = validateBotCheck('', 4500);
    expect(humanCheck.isHuman).toBe(true);

    // Bot filling honeypot field
    const botHoneypot = validateBotCheck('http://spam-link.ru', 5000);
    expect(botHoneypot.isHuman).toBe(false);
    expect(botHoneypot.reason).toContain('Honeypot');

    // Bot submitting in 0ms (instant script)
    const fastBot = validateBotCheck('', 0);
    expect(fastBot.isHuman).toBe(false);
    expect(fastBot.reason).toContain('Inhuman submission speed');
  });

  test('7. Role Permissions: Staff can reply, only owners can remove', () => {
    // Staff role
    expect(canReplyToReview('staff')).toBe(true);
    expect(canRemoveReview('staff')).toBe(false);

    // Owner role
    expect(canReplyToReview('owner')).toBe(true);
    expect(canRemoveReview('owner')).toBe(true);
  });

  test('8. Weekly Summary: Generates plain-English summary of tags and top/bottom dishes', () => {
    const reviews: DishReview[] = [
      {
        id: 'r1',
        restaurant_id: dummyRestaurantId,
        item_id: 'dish-1',
        rating: 5,
        tags: ['Great portion', 'Crispy texture'],
        session_token: 's1',
        status: 'published',
        report_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r2',
        restaurant_id: dummyRestaurantId,
        item_id: 'dish-1',
        rating: 5,
        tags: ['Great portion'],
        session_token: 's2',
        status: 'published',
        report_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'r3',
        restaurant_id: dummyRestaurantId,
        item_id: 'dish-1',
        rating: 4,
        tags: ['Crispy texture', 'Too salty'],
        session_token: 's3',
        status: 'published',
        report_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    const items = [{ id: 'dish-1', name: 'Artisan Sourdough Pizza' }];
    const summary = generateWeeklyReviewSummary(reviews, items);

    expect(summary.guestsLove).toContain('Great portion');
    expect(summary.guestsMention).toContain('Too salty');
    expect(summary.topRatedDish?.name).toBe('Artisan Sourdough Pizza');
    expect(summary.headlineSentence).toContain('Guests love:');
    expect(summary.headlineSentence).toContain('Guests mention:');
  });
});

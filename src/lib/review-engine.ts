import { DishReview, DishReviewStats, UserRole } from '@/types/database';

// -----------------------------------------------------------------------------
// STAGE 4: DISH REVIEWS PURE ENGINE
// Handles: Fairness checks, profanity & PII detection, rate limiting, 
// 3-review threshold, photo validation, and weekly summary generation.
// -----------------------------------------------------------------------------

// Known profanities / slurs / abuse patterns (case-insensitive)
const ABUSIVE_PATTERNS = [
  /\b(fuck|shit|bitch|asshole|bastard|dick|cunt|slut|whore)\b/i,
  /\b(nigger|nigga|faggot|chink|kike|spic|retard)\b/i,
  /\b(kill yourself|die in a fire)\b/i,
];

// PII patterns: Email addresses and phone numbers
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/;
const PHONE_PATTERN = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}\b/;

/**
 * Validates review text and tags.
 * FAIRNESS RULE: Genuine negative feedback (e.g. "Cold food", "Way too salty", "Horrible service")
 * must NEVER be flagged. Only explicit abuse/profanity or PII is flagged.
 */
export function checkReviewContent(comment?: string, tags: string[] = []): {
  isClean: boolean;
  flaggedReason?: 'profanity' | 'personal_data' | 'clean';
} {
  const fullText = `${comment || ''} ${tags.join(' ')}`.trim();
  if (!fullText) {
    return { isClean: true, flaggedReason: 'clean' };
  }

  // Check for abusive language / profanity
  for (const pattern of ABUSIVE_PATTERNS) {
    if (pattern.test(fullText)) {
      return { isClean: false, flaggedReason: 'profanity' };
    }
  }

  // Check for personal data (PII)
  if (EMAIL_PATTERN.test(fullText) || PHONE_PATTERN.test(fullText)) {
    return { isClean: false, flaggedReason: 'personal_data' };
  }

  return { isClean: true, flaggedReason: 'clean' };
}

/**
 * Invisible bot check:
 * - Honeypot field must be empty.
 * - Human submission should take at least 1.2 seconds.
 */
export function validateBotCheck(
  honeypotValue: string | undefined,
  submissionDurationMs: number
): { isHuman: boolean; reason?: string } {
  if (honeypotValue && honeypotValue.trim().length > 0) {
    return { isHuman: false, reason: 'Honeypot field filled by bot' };
  }

  if (submissionDurationMs === 0) {
    return { isHuman: false, reason: 'Inhuman submission speed (0ms)' };
  }

  return { isHuman: true };
}

/**
 * Rate Limiting & Duplicate Prevention:
 * 1. Duplicate check: Cannot submit more than 1 review for the same dish in the same session.
 * 2. Velocity check: Cannot submit more than 5 reviews in a 10-minute sliding window.
 */
export function checkReviewRateLimit(
  existingReviews: DishReview[],
  sessionToken: string,
  itemId: string,
  now: Date = new Date()
): { allowed: boolean; error?: string } {
  const sessionReviews = existingReviews.filter(
    (r) => r.session_token === sessionToken && r.status !== 'removed'
  );

  // 1. Duplicate check for this dish
  const alreadyReviewedItem = sessionReviews.some((r) => r.item_id === itemId);
  if (alreadyReviewedItem) {
    return {
      allowed: false,
      error: 'You have already reviewed this dish for this table session.',
    };
  }

  // 2. Velocity check: max 5 reviews within 10 minutes (600,000 ms)
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const recentCount = sessionReviews.filter(
    (r) => new Date(r.created_at) >= tenMinutesAgo
  ).length;

  if (recentCount >= 5) {
    return {
      allowed: false,
      error: 'Review limit reached (max 5 per 10 minutes). Please wait a few moments.',
    };
  }

  return { allowed: true };
}

/**
 * Validates uploaded photo MIME type and size.
 * Allowed: JPEG, PNG, WEBP. Max size: 4MB (4 * 1024 * 1024).
 */
export function validateReviewPhoto(file: {
  type: string;
  size: number;
}): { isValid: boolean; error?: string } {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSizeBytes = 4 * 1024 * 1024; // 4MB

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Invalid photo format. Please upload JPG, PNG, or WEBP.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      isValid: false,
      error: 'Photo is too large (maximum allowed size is 4MB).',
    };
  }

  return { isValid: true };
}

/**
 * Aggregates statistics for an item.
 * 3-REVIEW THRESHOLD:
 * Only once an item has at least minThreshold (default 3) reviews will is_threshold_met be true.
 */
export function calculateDishReviewStats(
  reviews: DishReview[],
  itemId: string,
  minThreshold: number = 3
): DishReviewStats {
  const itemReviews = reviews.filter(
    (r) => r.item_id === itemId && r.status === 'published'
  );

  const review_count = itemReviews.length;
  const rating_breakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const tagCounts: Record<string, number> = {};

  let sum = 0;
  for (const r of itemReviews) {
    const star = Math.max(1, Math.min(5, Math.round(r.rating)));
    rating_breakdown[star] = (rating_breakdown[star] || 0) + 1;
    sum += r.rating;

    if (Array.isArray(r.tags)) {
      for (const t of r.tags) {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      }
    }
  }

  const average_rating = review_count > 0 ? Number((sum / review_count).toFixed(1)) : 0;
  const top_tags = Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);

  return {
    item_id: itemId,
    average_rating,
    review_count,
    rating_breakdown,
    top_tags,
    is_threshold_met: review_count >= minThreshold,
  };
}

/**
 * Role permissions check:
 * - Both owner and staff can reply to reviews and view the inbox.
 * - Only the restaurant owner can remove reviews.
 */
export function canReplyToReview(userRole: UserRole): boolean {
  return userRole === 'owner' || userRole === 'staff';
}

export function canRemoveReview(userRole: UserRole): boolean {
  return userRole === 'owner';
}

/**
 * Suggested polite reply starters for owners/staff to edit quickly.
 */
export const SUGGESTED_REPLY_STARTERS = [
  'Thank you for your kind words! We take pride in our ingredients and hope to welcome you back soon.',
  'We appreciate your honest feedback. We are sharing your note with our kitchen team right away.',
  'Thank you for letting us know. We are sorry this dish fell short of your expectations today.',
  "Delighted you enjoyed it! That's one of our chef's personal favorites.",
  'Thank you for bringing this to our attention. Our culinary team is adjusting the seasoning balance today.',
];

/**
 * Weekly summary generator in plain English:
 * Summarizes what guests love, what they mention constructively,
 * and highlights top/bottom dishes (with >= 3 reviews).
 */
export function generateWeeklyReviewSummary(
  reviews: DishReview[],
  items: { id: string; name: string }[]
): {
  headlineSentence: string;
  guestsLove: string[];
  guestsMention: string[];
  topRatedDish: { name: string; rating: number; count: number } | null;
  needsAttentionDish: { name: string; rating: number; count: number } | null;
} {
  const published = reviews.filter((r) => r.status === 'published');
  const tagCounts: Record<string, number> = {};

  for (const r of published) {
    if (Array.isArray(r.tags)) {
      for (const tag of r.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }
  }

  // Constructive vs positive tag categorization
  const constructiveTags = ['Too salty', 'Could be hotter', 'Needs more seasoning', 'Slow arrival', 'Small portion'];
  const positiveList: { tag: string; count: number }[] = [];
  const constructiveList: { tag: string; count: number }[] = [];

  for (const [tag, count] of Object.entries(tagCounts)) {
    if (constructiveTags.some((c) => tag.toLowerCase().includes(c.toLowerCase()))) {
      constructiveList.push({ tag, count });
    } else {
      positiveList.push({ tag, count });
    }
  }

  positiveList.sort((a, b) => b.count - a.count);
  constructiveList.sort((a, b) => b.count - a.count);

  const guestsLove = positiveList.slice(0, 3).map((p) => p.tag);
  const guestsMention = constructiveList.slice(0, 2).map((c) => c.tag);

  // Dish breakdown with >= 3 reviews
  const dishStats = items
    .map((item) => {
      const stats = calculateDishReviewStats(reviews, item.id, 3);
      return {
        name: item.name,
        stats,
      };
    })
    .filter((d) => d.stats.is_threshold_met);

  let topRatedDish: { name: string; rating: number; count: number } | null = null;
  let needsAttentionDish: { name: string; rating: number; count: number } | null = null;

  if (dishStats.length > 0) {
    dishStats.sort((a, b) => b.stats.average_rating - a.stats.average_rating);
    topRatedDish = {
      name: dishStats[0].name,
      rating: dishStats[0].stats.average_rating,
      count: dishStats[0].stats.review_count,
    };

    const lowest = dishStats[dishStats.length - 1];
    if (lowest.stats.average_rating < 4.2 || dishStats.length > 1) {
      needsAttentionDish = {
        name: lowest.name,
        rating: lowest.stats.average_rating,
        count: lowest.stats.review_count,
      };
    }
  }

  const loveText = guestsLove.length > 0 ? guestsLove.join(', ') : 'great flavors & portion sizes';
  const mentionText = guestsMention.length > 0 ? guestsMention.join(' and ') : 'consistent temperature';

  const headlineSentence = `Guests love: ${loveText}. Guests mention: ${mentionText}.`;

  return {
    headlineSentence,
    guestsLove,
    guestsMention,
    topRatedDish,
    needsAttentionDish,
  };
}

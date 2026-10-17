import { MenuItem, Offer } from '@/types/database';
import { CartItem } from '@/types/menu';

export interface EvaluatedOfferStatus {
  isActive: boolean;
  reason?: 'inactive_status' | 'paused' | 'not_started' | 'expired' | 'wrong_day' | 'outside_hours';
  isEndingSoon: boolean;
  minutesRemaining?: number;
  urgencyText?: string;
  scheduleSummary: string;
}

export interface ItemPricingResult {
  itemId: string;
  originalPrice: number;
  finalPrice: number;
  savings: number;
  hasOffer: boolean;
  appliedOffer: Offer | null;
  badgeText?: string;
  urgencyText?: string;
  termsSummary?: string;
  conflictingOffers?: Offer[];
}

export interface CartPricingLineItem {
  cartId: string;
  itemId: string;
  name: string;
  quantity: number;
  originalUnitPrice: number;
  finalUnitPrice: number;
  originalLineTotal: number;
  finalLineTotal: number;
  lineSavings: number;
  appliedOfferTitle?: string;
}

export interface CartPricingResult {
  lines: CartPricingLineItem[];
  originalSubtotal: number;
  totalSavings: number;
  netSubtotal: number;
  tax: number;
  total: number;
  isTaxInclusive: boolean;
  taxRate: number;
  appliedOffers: {
    offer: Offer;
    totalSavings: number;
    description: string;
  }[];
  freeItemAwarded?: {
    item: MenuItem;
    reason: string;
  };
}

export interface PricingContext {
  currentTime?: Date;
  timezone?: string; // e.g. "Africa/Addis_Ababa", "America/New_York", "UTC"
  cart?: CartItem[];
  menuItemsMap?: Map<string, MenuItem>;
  taxMode?: 'inclusive' | 'exclusive';
  currencySymbol?: string;
}

// -----------------------------------------------------------------------------
// TIMEZONE & TIME EVALUATION UTILS (Pure Intl based, no external heavy libs)
// -----------------------------------------------------------------------------

export interface LocalTimeParts {
  year: number;
  month: number;
  day: number;
  dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
  hours: number;
  minutes: number;
  seconds: number;
  timeStringHHMM: string; // "HH:MM"
}

export function getLocalTimeParts(date: Date, timezone: string = 'UTC'): LocalTimeParts {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    const parts = formatter.formatToParts(date);
    let year = date.getUTCFullYear();
    let month = date.getUTCMonth() + 1;
    let day = date.getUTCDate();
    let hours = date.getUTCHours();
    let minutes = date.getUTCMinutes();
    let seconds = date.getUTCSeconds();
    let weekdayStr = 'Sun';

    for (const part of parts) {
      if (part.type === 'year') year = parseInt(part.value, 10);
      else if (part.type === 'month') month = parseInt(part.value, 10);
      else if (part.type === 'day') day = parseInt(part.value, 10);
      else if (part.type === 'hour') hours = parseInt(part.value, 10);
      else if (part.type === 'minute') minutes = parseInt(part.value, 10);
      else if (part.type === 'second') seconds = parseInt(part.value, 10);
      else if (part.type === 'weekday') weekdayStr = part.value;
    }

    const dayMap: Record<string, number> = {
      Sun: 0,
      Mon: 1,
      Tue: 2,
      Wed: 3,
      Thu: 4,
      Fri: 5,
      Sat: 6,
    };
    const dayOfWeek = dayMap[weekdayStr] ?? 0;
    const timeStringHHMM = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

    return {
      year,
      month,
      day,
      dayOfWeek,
      hours,
      minutes,
      seconds,
      timeStringHHMM,
    };
  } catch {
    // Fallback if timezone string is invalid
    const dayOfWeek = date.getDay();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
      dayOfWeek,
      hours,
      minutes,
      seconds: date.getSeconds(),
      timeStringHHMM: `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`,
    };
  }
}

// -----------------------------------------------------------------------------
// OFFER ACTIVATION EVALUATOR
// -----------------------------------------------------------------------------

export function evaluateOfferSchedule(
  offer: Offer,
  currentTime: Date = new Date(),
  timezone: string = offer.timezone || 'UTC'
): EvaluatedOfferStatus {
  // 1. Check paused
  if (offer.is_paused) {
    return {
      isActive: false,
      reason: 'paused',
      isEndingSoon: false,
      scheduleSummary: 'Offer is currently paused by staff.',
    };
  }

  // 2. Check general status
  if (offer.status === 'draft' || offer.status === 'ended') {
    return {
      isActive: false,
      reason: offer.status === 'draft' ? 'inactive_status' : 'expired',
      isEndingSoon: false,
      scheduleSummary: offer.status === 'draft' ? 'Draft offer' : 'Offer has ended',
    };
  }

  const currentTs = currentTime.getTime();

  // 3. Check absolute starts_at
  if (offer.starts_at) {
    const startTs = new Date(offer.starts_at).getTime();
    if (!isNaN(startTs) && currentTs < startTs) {
      return {
        isActive: false,
        reason: 'not_started',
        isEndingSoon: false,
        scheduleSummary: `Starts on ${new Date(offer.starts_at).toLocaleDateString()}`,
      };
    }
  }

  // 4. Check absolute ends_at
  if (offer.ends_at) {
    const endTs = new Date(offer.ends_at).getTime();
    if (!isNaN(endTs)) {
      if (currentTs >= endTs) {
        return {
          isActive: false,
          reason: 'expired',
          isEndingSoon: false,
          scheduleSummary: 'Offer has ended',
        };
      }
    }
  }

  // 5. Evaluate local time components in restaurant timezone
  const local = getLocalTimeParts(currentTime, timezone);

  // Check days of week
  if (offer.days_of_week && offer.days_of_week.length > 0) {
    if (!offer.days_of_week.includes(local.dayOfWeek)) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const allowedDays = offer.days_of_week.map((d) => dayNames[d]).join(', ');
      return {
        isActive: false,
        reason: 'wrong_day',
        isEndingSoon: false,
        scheduleSummary: `Runs on ${allowedDays}`,
      };
    }
  }

  // Check daily time window (start_time & end_time)
  let minutesRemaining: number | undefined;
  let isEndingSoon = false;
  let urgencyText: string | undefined;

  if (offer.start_time && offer.end_time) {
    const currentMins = local.hours * 60 + local.minutes;
    const [startH, startM] = offer.start_time.split(':').map((v) => parseInt(v, 10));
    const [endH, endM] = offer.end_time.split(':').map((v) => parseInt(v, 10));
    const windowStartMins = startH * 60 + (startM || 0);
    const windowEndMins = endH * 60 + (endM || 0);

    if (currentMins < windowStartMins || currentMins >= windowEndMins) {
      return {
        isActive: false,
        reason: 'outside_hours',
        isEndingSoon: false,
        scheduleSummary: `Daily from ${offer.start_time} to ${offer.end_time}`,
      };
    }

    minutesRemaining = windowEndMins - currentMins;
  } else if (offer.ends_at) {
    const endTs = new Date(offer.ends_at).getTime();
    minutesRemaining = Math.max(0, Math.floor((endTs - currentTs) / (1000 * 60)));
  }

  // Honest urgency only: show urgency ONLY if genuinely ending within honest_urgency_hours
  const urgencyWindowMins = (offer.honest_urgency_hours ?? 2) * 60;
  if (minutesRemaining !== undefined && minutesRemaining > 0 && minutesRemaining <= urgencyWindowMins) {
    isEndingSoon = true;
    if (minutesRemaining < 60) {
      urgencyText = `Ends in ${minutesRemaining}m`;
    } else {
      const hrs = Math.floor(minutesRemaining / 60);
      const mins = minutesRemaining % 60;
      urgencyText = mins > 0 ? `Ends in ${hrs}h ${mins}m` : `Ends in ${hrs}h`;
    }
  }

  // Build human-friendly schedule summary
  let scheduleSummary = 'Available now';
  if (offer.start_time && offer.end_time) {
    scheduleSummary = `Runs ${offer.start_time} – ${offer.end_time}`;
  } else if (offer.ends_at) {
    scheduleSummary = `Ends ${new Date(offer.ends_at).toLocaleDateString()}`;
  } else {
    scheduleSummary = 'Active offer';
  }

  return {
    isActive: true,
    isEndingSoon,
    minutesRemaining,
    urgencyText,
    scheduleSummary,
  };
}

// -----------------------------------------------------------------------------
// ITEM PRICING EVALUATION (Pure Function)
// -----------------------------------------------------------------------------

export function isItemApplicableToOffer(item: MenuItem, offer: Offer): boolean {
  // Free item threshold offers apply at the cart/order level, not per item
  if (offer.discount_type === 'free_item' || (offer.min_order_amount && offer.min_order_amount > 0)) {
    return false;
  }
  if (offer.scope_type === 'all') {
    // For fixed money-off offers, the item price must exceed the discount value
    if (offer.discount_type === 'fixed_amount' && item.price <= Number(offer.discount_value)) {
      return false;
    }
    return true;
  }
  if (offer.scope_type === 'categories') {
    return (offer.category_ids?.length ?? 0) > 0 && (offer.category_ids?.includes(item.category_id) ?? false);
  }
  if (offer.scope_type === 'items') {
    return (offer.item_ids?.length ?? 0) > 0 && (offer.item_ids?.includes(item.id) ?? false);
  }
  return false;
}

export function calculateDiscountAmount(originalPrice: number, offer: Offer): number {
  if (offer.discount_type === 'percentage') {
    const discount = (originalPrice * Number(offer.discount_value)) / 100;
    return Math.min(originalPrice, Math.max(0, Number(discount.toFixed(2))));
  }
  if (offer.discount_type === 'fixed_amount') {
    const discountVal = Number(offer.discount_value || 0);
    // Never allow a fixed discount to reduce item price to 0 ETB or negative
    if (originalPrice <= discountVal) {
      return 0;
    }
    return Math.min(originalPrice, Math.max(0, Number(discountVal.toFixed(2))));
  }
  return 0;
}

export function evaluateItemPricing(
  item: MenuItem,
  offers: Offer[],
  context: PricingContext = {}
): ItemPricingResult {
  const currentTime = context.currentTime || new Date();
  const timezone = context.timezone || 'Africa/Addis_Ababa';

  // 1. Find all active offers applying to this item
  const applicableOffersWithStatus = offers
    .map((offer) => ({
      offer,
      status: evaluateOfferSchedule(offer, currentTime, offer.timezone || timezone),
    }))
    .filter(({ offer, status }) => status.isActive && isItemApplicableToOffer(item, offer));

  if (applicableOffersWithStatus.length === 0) {
    return {
      itemId: item.id,
      originalPrice: item.price,
      finalPrice: item.price,
      savings: 0,
      hasOffer: false,
      appliedOffer: null,
    };
  }

  const conflictingOffers = applicableOffersWithStatus.map((o) => o.offer);

  // 2. Conflict & Stacking resolution
  // Default rule: Best discount wins (gives customer highest savings)
  let bestOffer = applicableOffersWithStatus[0].offer;
  let maxSavings = calculateDiscountAmount(item.price, bestOffer);
  let bestStatus = applicableOffersWithStatus[0].status;

  for (let i = 1; i < applicableOffersWithStatus.length; i++) {
    const current = applicableOffersWithStatus[i];
    const savings = calculateDiscountAmount(item.price, current.offer);

    // Stacking rule check:
    if (current.offer.stacking_rule === 'allow_stack' && bestOffer.stacking_rule === 'allow_stack') {
      maxSavings += savings;
    } else if (savings > maxSavings) {
      bestOffer = current.offer;
      maxSavings = savings;
      bestStatus = current.status;
    }
  }

  maxSavings = Math.min(item.price, Number(maxSavings.toFixed(2)));
  const finalPrice = Math.max(0, Number((item.price - maxSavings).toFixed(2)));

  const currency = context.currencySymbol || '$';
  let badgeText = bestOffer.badge_text;
  if (!badgeText) {
    badgeText = bestOffer.discount_type === 'percentage' 
      ? `${bestOffer.discount_value}% Off` 
      : `Save ${currency}${currency === '$' ? '' : ' '}${maxSavings.toFixed(0)}`;
  } else if (context.currencySymbol && context.currencySymbol !== '$') {
    badgeText = badgeText.replace(/\$\s*/g, `${context.currencySymbol} `).trim();
  }

  return {
    itemId: item.id,
    originalPrice: item.price,
    finalPrice,
    savings: maxSavings,
    hasOffer: maxSavings > 0,
    appliedOffer: bestOffer,
    badgeText,
    urgencyText: bestStatus.urgencyText,
    termsSummary: bestOffer.description || bestStatus.scheduleSummary,
    conflictingOffers: conflictingOffers.length > 1 ? conflictingOffers : undefined,
  };
}

// -----------------------------------------------------------------------------
// CART PRICING EVALUATION (Pure Function)
// -----------------------------------------------------------------------------

export function evaluateCartPricing(
  cart: CartItem[],
  offers: Offer[],
  taxRate: number = 0.08,
  context: PricingContext = {}
): CartPricingResult {
  const currentTime = context.currentTime || new Date();
  const timezone = context.timezone || 'Africa/Addis_Ababa';

  // Active offers in context
  const activeOffers = offers.filter(
    (o) => evaluateOfferSchedule(o, currentTime, o.timezone || timezone).isActive
  );

  let originalSubtotal = 0;
  let finalSubtotal = 0;
  const lines: CartPricingLineItem[] = [];
  const appliedOfferMap = new Map<string, { offer: Offer; totalSavings: number }>();

  for (const entry of cart) {
    const addonsTotal = entry.options.reduce((sum, o) => sum + Number(o.price || 0), 0);
    const itemPricing = evaluateItemPricing(entry.item, activeOffers, context);

    const originalUnitPrice = entry.item.price + addonsTotal;
    const finalUnitPrice = itemPricing.finalPrice + addonsTotal;
    const originalLineTotal = Number((originalUnitPrice * entry.quantity).toFixed(2));
    const finalLineTotal = Number((finalUnitPrice * entry.quantity).toFixed(2));
    const lineSavings = Number((originalLineTotal - finalLineTotal).toFixed(2));

    originalSubtotal += originalLineTotal;
    finalSubtotal += finalLineTotal;

    if (itemPricing.appliedOffer && lineSavings > 0) {
      const existing = appliedOfferMap.get(itemPricing.appliedOffer.id);
      if (existing) {
        existing.totalSavings += lineSavings;
      } else {
        appliedOfferMap.set(itemPricing.appliedOffer.id, {
          offer: itemPricing.appliedOffer,
          totalSavings: lineSavings,
        });
      }
    }

    lines.push({
      cartId: entry.cartId,
      itemId: entry.item.id,
      name: entry.item.name,
      quantity: entry.quantity,
      originalUnitPrice,
      finalUnitPrice,
      originalLineTotal,
      finalLineTotal,
      lineSavings,
      appliedOfferTitle: itemPricing.appliedOffer?.title,
    });
  }

  // Check Cart-Level Offers: Free Item with order over $X
  let freeItemAwarded: { item: MenuItem; reason: string } | undefined;
  for (const offer of activeOffers) {
    if (offer.template_type === 'free_item' && offer.min_order_amount && finalSubtotal >= offer.min_order_amount) {
      if (offer.free_item_id && context.menuItemsMap?.has(offer.free_item_id)) {
        const item = context.menuItemsMap.get(offer.free_item_id)!;
        freeItemAwarded = {
          item,
          reason: `Free gift for spending over ${context.currencySymbol || 'ETB'} ${(offer.min_order_amount ?? 0).toFixed(2)}`,
        };
        appliedOfferMap.set(offer.id, {
          offer,
          totalSavings: item.price,
        });
      }
    }
  }

  originalSubtotal = Number(originalSubtotal.toFixed(2));
  finalSubtotal = Number(finalSubtotal.toFixed(2));
  const totalSavings = Number((originalSubtotal - finalSubtotal).toFixed(2));
  
  // Tax evaluation: Owner chooses between Tax Inclusive (default) vs Tax Exclusive
  const isTaxInclusive = context.taxMode === 'inclusive';
  const tax = isTaxInclusive ? 0 : Number((finalSubtotal * taxRate).toFixed(2));
  const total = Number((finalSubtotal + tax).toFixed(2));

  const appliedOffersList = Array.from(appliedOfferMap.values()).map(({ offer, totalSavings }) => ({
    offer,
    totalSavings: Number(totalSavings.toFixed(2)),
    description: offer.title,
  }));

  return {
    lines,
    originalSubtotal,
    totalSavings,
    netSubtotal: finalSubtotal,
    tax,
    total,
    isTaxInclusive,
    taxRate,
    appliedOffers: appliedOffersList,
    freeItemAwarded,
  };
}

// -----------------------------------------------------------------------------
// DETECT CONFLICTS BETWEEN OFFERS (Plain-language helper for Admin)
// -----------------------------------------------------------------------------

export interface OfferConflictWarning {
  offerA: Offer;
  offerB: Offer;
  overlappingItemNames: string[];
  warningMessage: string;
}

export function detectOfferConflicts(offers: Offer[], allItems: MenuItem[]): OfferConflictWarning[] {
  const warnings: OfferConflictWarning[] = [];
  const activeOrScheduled = offers.filter((o) => o.status !== 'ended' && !o.is_paused);

  for (let i = 0; i < activeOrScheduled.length; i++) {
    for (let j = i + 1; j < activeOrScheduled.length; j++) {
      const a = activeOrScheduled[i];
      const b = activeOrScheduled[j];

      // Check day overlap
      const daysA = a.days_of_week ?? [0, 1, 2, 3, 4, 5, 6];
      const daysB = b.days_of_week ?? [0, 1, 2, 3, 4, 5, 6];
      const hasDayOverlap = daysA.some((d) => daysB.includes(d));

      if (!hasDayOverlap) continue;

      // Find overlapping items
      const itemsA = allItems.filter((item) => isItemApplicableToOffer(item, a));
      const itemsB = allItems.filter((item) => isItemApplicableToOffer(item, b));

      const overlap = itemsA.filter((itemA) => itemsB.some((itemB) => itemB.id === itemA.id));

      if (overlap.length > 0) {
        const itemNames = overlap.map((item) => item.name);
        const sampleNames = itemNames.slice(0, 2).join(' and ');
        const extraCount = itemNames.length > 2 ? ` (+${itemNames.length - 2} more)` : '';

        warnings.push({
          offerA: a,
          offerB: b,
          overlappingItemNames: itemNames,
          warningMessage: `These two offers overlap on ${sampleNames}${extraCount}. By default, whichever offer gives guests the higher discount will win.`,
        });
      }
    }
  }

  return warnings;
}

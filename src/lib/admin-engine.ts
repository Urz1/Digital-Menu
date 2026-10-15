import { MenuItem, Category, ScheduledMenu } from '@/types/database';

// -----------------------------------------------------------------------------
// STAGE 5: ADMIN EXPERIENCE PURE ENGINE
// Handles: WCAG contrast ratio checks, bulk pricing math, menu matrix classification,
// CSV import/export, and scheduled menu evaluation.
// -----------------------------------------------------------------------------

/**
 * Calculates relative luminance of an sRGB color.
 * Reference: W3C WCAG 2.1 specs
 */
export function getLuminance(hex: string): number {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const a = [r, g, b].map((v) => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

/**
 * Calculates contrast ratio between two colors (1:1 to 21:1).
 */
export function getContrastRatio(hexA: string, hexB: string): number {
  try {
    const lumA = getLuminance(hexA);
    const lumB = getLuminance(hexB);
    const brightest = Math.max(lumA, lumB);
    const darkest = Math.min(lumA, lumB);
    return Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));
  } catch {
    return 4.5; // fallback
  }
}

/**
 * Checks if color pairing passes WCAG 2.2 AA (minimum 4.5:1 for normal text).
 */
export function checkWcagContrast(
  foregroundHex: string,
  backgroundHex: string
): {
  ratio: number;
  passesAA: boolean;
  passesNormal: boolean;
  warning?: string;
  plainWarning: string;
} {
  const ratio = getContrastRatio(foregroundHex, backgroundHex);
  const passesAA = ratio >= 4.5;

  let warning: string | undefined;
  if (!passesAA) {
    warning = `Contrast ratio is ${ratio}:1, which is below the WCAG AA standard (4.5:1). Text may be difficult to read on mobile screens in sunlight.`;
  }

  return {
    ratio,
    passesAA,
    passesNormal: passesAA,
    warning,
    plainWarning:
      warning || 'Contrast meets WCAG 2.2 AA accessibility standards (4.5:1 ratio).',
  };
}

/**
 * Bulk price updates by percentage or fixed amount.
 */
export function applyBulkPriceChange(
  items: MenuItem[],
  selectedIds: string[],
  changeType: 'percent' | 'amount',
  value: number
): MenuItem[] {
  const targetIds = new Set(selectedIds);

  return items.map((item) => {
    if (!targetIds.has(item.id)) return item;

    let newPrice = item.price;
    if (changeType === 'percent') {
      newPrice = item.price * (1 + value / 100);
    } else {
      newPrice = item.price + value;
    }

    // Minimum price is $0.00, rounded to 2 decimal places
    newPrice = Math.max(0, Math.round(newPrice * 100) / 100);

    return {
      ...item,
      price: newPrice,
    };
  });
}

/**
 * Menu Matrix classification:
 * - Stars: High views, high orders
 * - Workhorses: Moderate views, high orders
 * - Hidden Gems: Low views, high rating (>= 4.5)
 * - Underperformers: High views, low conversion / orders
 */
export type MatrixClassification = 'star' | 'workhorse' | 'hidden_gem' | 'underperformer' | 'standard';

export interface MatrixItemInsight {
  item_id: string;
  name: string;
  classification: MatrixClassification;
  badgeLabel: string;
  suggestion: string;
}

export function classifyMenuMatrix(
  items: MenuItem[],
  viewsMap: Record<string, number>,
  ordersMap: Record<string, number>,
  ratingMap: Record<string, number>
): MatrixItemInsight[] {
  return items.map((item) => {
    const views = viewsMap[item.id] || 0;
    const orders = ordersMap[item.id] || 0;
    const rating = ratingMap[item.id] || 0;

    let classification: MatrixClassification = 'standard';
    let badgeLabel = 'Regular';
    let suggestion = 'Performing consistently in its category.';

    if (views >= 100 && orders >= 20) {
      classification = 'star';
      badgeLabel = '⭐ Star';
      suggestion = 'High views and top sales. Keep front and center on your menu top.';
    } else if (views < 100 && orders >= 15) {
      classification = 'workhorse';
      badgeLabel = '🐎 Workhorse';
      suggestion = 'Consistent favorite. Consider pairing with drinks or featuring in combo deals.';
    } else if (views < 80 && rating >= 4.5 && rating > 0) {
      classification = 'hidden_gem';
      badgeLabel = '💎 Hidden Gem';
      suggestion = 'Loved by guests who try it! Move up in category order or feature as Chef Pick.';
    } else if (views >= 100 && orders < 8) {
      classification = 'underperformer';
      badgeLabel = '📉 Underperformer';
      suggestion = 'High diner interest but low orders. Consider reviewing pricing or photo.';
    }

    return {
      item_id: item.id,
      name: item.name,
      classification,
      badgeLabel,
      suggestion,
    };
  });
}

/**
 * Export menu items to CSV format.
 */
export function exportMenuToCsv(items: MenuItem[], categories: Category[]): string {
  const catMap = new Map(categories.map((c) => [c.id, c.name]));
  const headers = ['ID', 'Name', 'Category', 'Price', 'Available', 'ChefsPick', 'Tags', 'Allergens', 'Description'];
  
  const rows = items.map((item) => [
    item.id,
    `"${item.name.replace(/"/g, '""')}"`,
    `"${(catMap.get(item.category_id) || '').replace(/"/g, '""')}"`,
    item.price.toFixed(2),
    item.is_available ? 'Yes' : 'No',
    item.is_chefs_pick ? 'Yes' : 'No',
    `"${(item.tags || []).join(', ')}"`,
    `"${(item.allergens || []).join(', ')}"`,
    `"${(item.description || '').replace(/"/g, '""')}"`,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Parse CSV format into partial menu items.
 */
export function parseMenuFromCsv(
  csvText: string,
  restaurantId: string,
  defaultCategoryId: string
): { success: boolean; items: Partial<MenuItem>[]; errors: string[] } {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length <= 1) {
    return { success: false, items: [], errors: ['CSV file is empty or missing data rows.'] };
  }

  const items: Partial<MenuItem>[] = [];
  const errors: string[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
    if (parts.length < 3) {
      errors.push(`Row ${i + 1} does not have enough columns.`);
      continue;
    }

    const name = parts[1]?.replace(/^"|"$/g, '').trim();
    const priceStr = parts[3]?.replace(/^"|"$/g, '').trim();
    const price = parseFloat(priceStr);

    if (!name) {
      errors.push(`Row ${i + 1}: Name is required.`);
      continue;
    }

    if (isNaN(price) || price < 0) {
      errors.push(`Row ${i + 1}: Invalid price "${priceStr}".`);
      continue;
    }

    items.push({
      id: `item-csv-${Date.now()}-${i}`,
      restaurant_id: restaurantId,
      category_id: defaultCategoryId,
      name,
      price,
      is_available: true,
      is_chefs_pick: false,
      tags: [],
      allergens: [],
      sort_order: i,
    });
  }

  return {
    success: errors.length === 0,
    items,
    errors,
  };
}

/**
 * Checks if a scheduled menu is currently active in the given timezone.
 */
export function isScheduledMenuActive(
  menu: ScheduledMenu,
  currentTime: Date,
  timezone: string = 'UTC'
): boolean {
  if (!menu.is_active) return false;

  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      weekday: 'narrow',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(currentTime);

    const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
    const minute = parseInt(parts.find((p) => p.type === 'minute')?.value || '0', 10);
    const currentMins = hour * 60 + minute;

    const [startH, startM] = menu.start_time.split(':').map((v) => parseInt(v, 10));
    const [endH, endM] = menu.end_time.split(':').map((v) => parseInt(v, 10));
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    if (startMins <= endMins) {
      return currentMins >= startMins && currentMins <= endMins;
    } else {
      // Overnight window (e.g. 22:00 to 02:00)
      return currentMins >= startMins || currentMins <= endMins;
    }
  } catch {
    return true;
  }
}

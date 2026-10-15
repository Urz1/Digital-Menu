/**
 * Cookie-light, Privacy-First Analytics Module
 * Modeled after Plausible / Fathom:
 * - 0 Cookies
 * - 0 LocalStorage personal identifiers
 * - 0 Device fingerprinting
 * - Fully GDPR, CCPA, and PECR compliant
 */

export interface AnalyticsEvent {
  name: string;
  restaurantId: string;
  props?: Record<string, string | number | boolean>;
}

export function trackEvent(
  eventName: string,
  restaurantId: string,
  props?: Record<string, string | number | boolean>
): void {
  try {
    // If running in browser and Plausible is loaded via script tag
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const win = typeof window !== 'undefined' ? (window as any) : null;
    if (win && typeof win.plausible === 'function') {
      win.plausible(eventName, { props: { restaurantId, ...props } });
      return;
    }

    // Fallback: Dispatch CustomEvent for developer/host consumption without storing PII
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('digitalmenu:analytics', {
          detail: { eventName, restaurantId, props, timestamp: Date.now() },
        })
      );
    }
  } catch {
    // Silent failover to prevent disrupting guest dining flow
  }
}

/**
 * Reliability & Error Monitoring Integration
 * Sentry-ready error reporting with graceful fallbacks
 */

export interface ErrorContext {
  restaurantId?: string;
  tableNumber?: string;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export function captureException(error: unknown, context?: ErrorContext): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = typeof window !== 'undefined' ? (window as any) : null;

  if (win && win.Sentry && typeof win.Sentry.captureException === 'function') {
    win.Sentry.captureException(error, {
      tags: { restaurantId: context?.restaurantId, ...context?.tags },
      extra: context?.extra,
    });
    return;
  }

  // Graceful fallback to structured logger
  if (process.env.NODE_ENV !== 'production') {
    console.error('[ErrorMonitor] Captured Exception:', error, context);
  }
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info'): void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = typeof window !== 'undefined' ? (window as any) : null;

  if (win && win.Sentry && typeof win.Sentry.captureMessage === 'function') {
    win.Sentry.captureMessage(message, level);
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[ErrorMonitor] [${level.toUpperCase()}]:`, message);
  }
}

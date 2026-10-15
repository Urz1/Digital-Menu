/**
 * In-Memory Sliding-Window Rate Limiter for Public Endpoints
 * Prevents DDoS, spam orders, waiter call flooding, and review stuffing.
 */

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number;
  errorMessage?: string;
}

class SlidingWindowRateLimiter {
  private requests: Map<string, number[]> = new Map();

  /**
   * Check and record a request attempt
   */
  public check(key: string, config: RateLimitConfig): RateLimitResult {
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Retrieve or initialize history
    const timestamps = (this.requests.get(key) || []).filter((ts) => ts > windowStart);

    if (timestamps.length >= config.maxRequests) {
      const oldestInWindow = timestamps[0];
      const resetMs = Math.max(0, oldestInWindow + config.windowMs - now);
      return {
        allowed: false,
        remaining: 0,
        resetMs,
        errorMessage: `Too many requests. Please wait ${Math.ceil(resetMs / 1000)}s before trying again.`,
      };
    }

    // Allow and append current timestamp
    timestamps.push(now);
    this.requests.set(key, timestamps);

    return {
      allowed: true,
      remaining: config.maxRequests - timestamps.length,
      resetMs: config.windowMs,
    };
  }

  /**
   * Clear old keys periodically
   */
  public cleanup(maxAgeMs: number = 3600000): void {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, timestamps] of this.requests.entries()) {
      const active = timestamps.filter((ts) => ts > cutoff);
      if (active.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, active);
      }
    }
  }

  /**
   * Reset key (e.g. for testing)
   */
  public reset(key?: string): void {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

export const rateLimiter = new SlidingWindowRateLimiter();

// Pre-configured rate limits for customer operations
export const RATE_LIMITS = {
  SERVICE_REQUEST: { maxRequests: 3, windowMs: 2 * 60 * 1000 }, // 3 requests per 2 mins per table
  SUBMIT_ORDER: { maxRequests: 4, windowMs: 5 * 60 * 1000 },    // 4 orders per 5 mins per table
  DISH_REVIEW: { maxRequests: 5, windowMs: 10 * 60 * 1000 },    // 5 reviews per 10 mins per device
  SEARCH_QUERY: { maxRequests: 30, windowMs: 60 * 1000 },        // 30 searches per min
};

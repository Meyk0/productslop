export type RateLimitDecision =
  | {
      allowed: true;
      remaining: number;
      resetAt: number;
    }
  | {
      allowed: false;
      remaining: 0;
      resetAt: number;
      retryAfterSeconds: number;
    };

export type RateLimitConfig = {
  key: string;
  limit: number;
  windowMs: number;
  now?: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

export class MemoryRateLimiter {
  private readonly buckets = new Map<string, Bucket>();

  check({ key, limit, windowMs, now = Date.now() }: RateLimitConfig): RateLimitDecision {
    const existing = this.buckets.get(key);
    const bucket =
      existing && existing.resetAt > now
        ? existing
        : {
            count: 0,
            resetAt: now + windowMs,
          };

    if (bucket.count >= limit) {
      this.buckets.set(key, bucket);
      return {
        allowed: false,
        remaining: 0,
        resetAt: bucket.resetAt,
        retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      };
    }

    bucket.count += 1;
    this.buckets.set(key, bucket);

    return {
      allowed: true,
      remaining: Math.max(0, limit - bucket.count),
      resetAt: bucket.resetAt,
    };
  }

  reset() {
    this.buckets.clear();
  }
}

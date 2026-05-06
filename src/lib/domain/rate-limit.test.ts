import { describe, expect, it } from "vitest";
import { MemoryRateLimiter } from "@/lib/domain/rate-limit";

describe("MemoryRateLimiter", () => {
  it("allows requests until the limit is reached", () => {
    const limiter = new MemoryRateLimiter();

    expect(
      limiter.check({ key: "submit:ip", limit: 2, windowMs: 60_000, now: 1_000 }),
    ).toMatchObject({ allowed: true, remaining: 1 });
    expect(
      limiter.check({ key: "submit:ip", limit: 2, windowMs: 60_000, now: 2_000 }),
    ).toMatchObject({ allowed: true, remaining: 0 });
    expect(
      limiter.check({ key: "submit:ip", limit: 2, windowMs: 60_000, now: 3_000 }),
    ).toMatchObject({ allowed: false, retryAfterSeconds: 58 });
  });

  it("opens a fresh bucket after the window resets", () => {
    const limiter = new MemoryRateLimiter();

    limiter.check({ key: "reaction:ip", limit: 1, windowMs: 10_000, now: 1_000 });

    expect(
      limiter.check({ key: "reaction:ip", limit: 1, windowMs: 10_000, now: 11_001 }),
    ).toMatchObject({ allowed: true, remaining: 0 });
  });
});

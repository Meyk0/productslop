import "server-only";

import { createHash } from "node:crypto";
import { MemoryRateLimiter, type RateLimitDecision } from "@/lib/domain/rate-limit";

const limiter = new MemoryRateLimiter();

export function hashIp(ip: string): string {
  const salt = process.env.IP_HASH_SALT ?? "local-dev-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function checkSubmissionRateLimit(ip: string): RateLimitDecision {
  return limiter.check({
    key: `submit:${hashIp(ip)}`,
    limit: 3,
    windowMs: 60 * 60 * 1000,
  });
}

export function checkReactionRateLimit(ip: string): RateLimitDecision {
  return limiter.check({
    key: `reaction:${hashIp(ip)}`,
    limit: 60,
    windowMs: 60 * 60 * 1000,
  });
}

export async function verifyTurnstileToken({
  token,
  ip,
}: {
  token?: string;
  ip?: string;
}): Promise<{ ok: true; skipped: boolean } | { ok: false; message: string }> {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return { ok: true, skipped: true };
  }

  if (!token) {
    return { ok: false, message: "Captcha verification is required." };
  }

  const formData = new FormData();
  formData.set("secret", secret);
  formData.set("response", token);
  if (ip) {
    formData.set("remoteip", ip);
  }

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    return { ok: false, message: "Captcha verification failed." };
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success
    ? { ok: true, skipped: false }
    : { ok: false, message: "Captcha verification failed." };
}

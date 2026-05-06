import "server-only";

import { createHash } from "node:crypto";
import {
  validateSlopCopy,
  validateSubmissionEmail,
  validateSubmittedUrlDomain,
} from "@/lib/domain/abuse";
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

export async function assertSubmissionPreflight(input: {
  url: string;
  email?: string;
}): Promise<void> {
  const domain = validateSubmittedUrlDomain(input.url);
  if (!domain.ok) {
    throw new Error(domain.message);
  }

  const email = validateSubmissionEmail(input.email);
  if (!email.ok) {
    throw new Error(email.message);
  }

  const safeBrowsing = await checkSafeBrowsingUrl(input.url);
  if (!safeBrowsing.ok) {
    throw new Error(safeBrowsing.message);
  }
}

export function assertSlopCopySafe(input: { title?: string; tagline?: string }): void {
  const copy = validateSlopCopy(input);
  if (!copy.ok) {
    throw new Error(copy.message);
  }
}

export async function checkSafeBrowsingUrl(
  url: string,
): Promise<{ ok: true; skipped: boolean } | { ok: false; message: string }> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    return { ok: true, skipped: true };
  }

  const endpoint = new URL("https://safebrowsing.googleapis.com/v4/threatMatches:find");
  endpoint.searchParams.set("key", apiKey);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      client: {
        clientId: "productslop",
        clientVersion: "0.1.0",
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION",
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url }],
      },
    }),
  });

  if (!response.ok) {
    return { ok: false, message: "URL safety check failed." };
  }

  const result = (await response.json()) as { matches?: unknown[] };
  return result.matches?.length
    ? { ok: false, message: "That URL is flagged by Safe Browsing." }
    : { ok: true, skipped: false };
}

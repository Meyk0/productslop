import "server-only";

import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
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

  const resolution = await checkPublicUrlResolution(input.url);
  if (!resolution.ok) {
    throw new Error(resolution.message);
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

export async function checkPublicUrlResolution(
  rawUrl: string,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const hostname = normalizeHostname(new URL(rawUrl).hostname);

  if (isBlockedAddress(hostname)) {
    return {
      ok: false,
      message: "That URL points at a private or reserved network.",
    };
  }

  let addresses: Array<{ address: string }>;
  try {
    addresses = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    return { ok: false, message: "That URL needs to resolve publicly." };
  }

  if (addresses.length === 0) {
    return { ok: false, message: "That URL needs to resolve publicly." };
  }

  if (addresses.some((entry) => isBlockedAddress(entry.address))) {
    return {
      ok: false,
      message: "That URL points at a private or reserved network.",
    };
  }

  return { ok: true };
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
}

function isBlockedAddress(address: string): boolean {
  const normalized = normalizeHostname(address);
  const ipVersion = isIP(normalized);

  if (ipVersion === 4) {
    return isBlockedIpv4(normalized);
  }

  if (ipVersion === 6) {
    return isBlockedIpv6(normalized);
  }

  return normalized === "localhost" || normalized.endsWith(".localhost");
}

function isBlockedIpv4(address: string): boolean {
  const [first, second] = address.split(".").map((octet) => Number(octet));

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 0) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19)) ||
    (first === 198 && second === 51) ||
    (first === 203 && second === 0)
  );
}

function isBlockedIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  const mappedIpv4 = normalized.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)?.[1];

  if (mappedIpv4) {
    return isBlockedIpv4(mappedIpv4);
  }

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb") ||
    normalized.startsWith("ff")
  );
}

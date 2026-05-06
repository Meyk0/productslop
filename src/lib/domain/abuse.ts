export type SafetyResult = { ok: true } | { ok: false; message: string };

const blockedHostnames = new Set([
  "bit.ly",
  "buff.ly",
  "cutt.ly",
  "goo.gl",
  "is.gd",
  "lnkd.in",
  "ow.ly",
  "rb.gy",
  "rebrand.ly",
  "s.id",
  "shorturl.at",
  "t.co",
  "tiny.cc",
  "tinyurl.com",
]);

const disposableEmailDomains = new Set([
  "10minutemail.com",
  "guerrillamail.com",
  "mailinator.com",
  "sharklasers.com",
  "temp-mail.org",
  "throwawaymail.com",
  "yopmail.com",
]);

const blockedCopyPatterns = [
  /\bcredential\s+harvester\b/i,
  /\bpassword\s+stealer\b/i,
  /\bprivate\s+key\b/i,
  /\bseed\s+phrase\b/i,
  /\bwallet\s+drainer\b/i,
  /\bfree\s+crypto\b/i,
  /\bmalware\b/i,
  /\bphishing\b/i,
  /\bransomware\b/i,
  /\bfuck(?:ed|er|ing)?\b/i,
  /\basshole\b/i,
  /\bbitch\b/i,
];

export function validateSubmittedUrlDomain(rawUrl: string): SafetyResult {
  const hostname = normalizeHostname(new URL(rawUrl).hostname);

  if (matchesHostnameList(hostname, blockedHostnames)) {
    return {
      ok: false,
      message: "Submit the direct public project URL, not a masked or blocked domain.",
    };
  }

  return { ok: true };
}

export function validateSubmissionEmail(email?: string): SafetyResult {
  if (!email) {
    return { ok: true };
  }

  const domain = normalizeHostname(email.split("@").at(-1) ?? "");
  if (!domain || matchesHostnameList(domain, disposableEmailDomains)) {
    return {
      ok: false,
      message: "Use a durable email for edit/delete links or leave it blank.",
    };
  }

  return { ok: true };
}

export function validateSlopCopy(input: {
  title?: string;
  tagline?: string;
}): SafetyResult {
  const copy = [input.title, input.tagline].filter(Boolean).join(" ");

  if (blockedCopyPatterns.some((pattern) => pattern.test(copy))) {
    return {
      ok: false,
      message: "That slop copy trips the safety filter.",
    };
  }

  return { ok: true };
}

function matchesHostnameList(hostname: string, blocked: Set<string>): boolean {
  return [...blocked].some(
    (blockedHostname) =>
      hostname === blockedHostname || hostname.endsWith(`.${blockedHostname}`),
  );
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/\.$/, "");
}

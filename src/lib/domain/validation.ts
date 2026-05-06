import { z } from "zod";

export type SubmissionInput = {
  url: string;
  email?: string;
  slopperHandle?: string;
};

const rawSubmissionSchema = z.object({
  url: z.string().trim().min(1, "Paste a URL first."),
  email: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().email("Use a valid email or leave it blank.").optional(),
  ),
  slopperHandle: z.string().trim().max(32).optional(),
  honeypot: z.string().optional(),
  startedAt: z.coerce.number().optional(),
});

export type SubmissionParseResult =
  | { ok: true; data: SubmissionInput }
  | { ok: false; message: string };

export function parseSubmissionInput(input: unknown, now = Date.now()): SubmissionParseResult {
  const parsed = rawSubmissionSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "That submission looks off.",
    };
  }

  if (parsed.data.honeypot) {
    return { ok: false, message: "That was a little too bot-shaped." };
  }

  if (parsed.data.startedAt && now - parsed.data.startedAt < 2000) {
    return { ok: false, message: "Give the form a beat and try again." };
  }

  const urlResult = normalizeHttpsUrl(parsed.data.url);
  if (!urlResult.ok) {
    return { ok: false, message: urlResult.message };
  }

  const handleResult = normalizeSlopperHandle(parsed.data.slopperHandle);
  if (!handleResult.ok) {
    return { ok: false, message: handleResult.message };
  }

  return {
    ok: true,
    data: {
      url: urlResult.url,
      email: parsed.data.email,
      slopperHandle: handleResult.handle,
    },
  };
}

export function normalizeHttpsUrl(
  rawUrl: string,
): { ok: true; url: string } | { ok: false; message: string } {
  let url: URL;
  const trimmed = rawUrl.trim();
  const candidate = hasUrlScheme(trimmed) ? trimmed : `https://${trimmed}`;

  try {
    url = new URL(candidate);
  } catch {
    return { ok: false, message: "Use a public HTTPS URL or domain." };
  }

  if (url.protocol !== "https:") {
    return { ok: false, message: "Only HTTPS slop makes it onto the board." };
  }

  if (["localhost", "127.0.0.1", "0.0.0.0"].includes(url.hostname)) {
    return { ok: false, message: "Localhost is not public slop yet." };
  }

  url.hash = "";
  return { ok: true, url: url.toString() };
}

function hasUrlScheme(value: string): boolean {
  return /^[a-z][a-z\d+.-]*:\/\//i.test(value);
}

export function normalizeSlopperHandle(
  rawHandle?: string,
): { ok: true; handle?: string } | { ok: false; message: string } {
  const trimmed = rawHandle?.trim();
  if (!trimmed) {
    return { ok: true, handle: undefined };
  }

  const handle = trimmed.replace(/^@+/, "");
  if (!/^[A-Za-z0-9_]{1,15}$/.test(handle)) {
    return { ok: false, message: "Use a valid X handle or leave it blank." };
  }

  return { ok: true, handle: `@${handle}` };
}

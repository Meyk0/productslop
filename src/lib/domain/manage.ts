import { z } from "zod";

const taglineSchema = z
  .string()
  .trim()
  .min(4, "Give the tagline a little more shape.")
  .max(100, "Keep the tagline under 100 characters.");

export type ManageParseResult =
  | { ok: true; tagline: string }
  | { ok: false; message: string };

export function parseTagline(value: unknown): ManageParseResult {
  const parsed = taglineSchema.safeParse(value);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "That tagline does not fit.",
    };
  }

  return { ok: true, tagline: parsed.data };
}

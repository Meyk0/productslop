import { z } from "zod";

const reslopRequestSchema = z.object({
  manageToken: z.string().trim().min(16, "Missing reslop token.").max(128),
});

export type ReslopParseResult =
  | { ok: true; manageToken: string }
  | { ok: false; message: string };

export function parseReslopRequest(input: unknown): ReslopParseResult {
  const parsed = reslopRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Unable to reslop this launch.",
    };
  }

  return { ok: true, manageToken: parsed.data.manageToken };
}

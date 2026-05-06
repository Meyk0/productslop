import { z } from "zod";
import { SLOP_TYPES, type SlopType } from "@/lib/domain/slop";

const slopTypeIds = SLOP_TYPES.map((type) => type.id) as [SlopType, ...SlopType[]];

export const aiSlopMetadataSchema = z.object({
  tagline: z.string().trim().min(4).max(100),
  type: z.enum(slopTypeIds),
  moderation_flag: z.boolean(),
  moderation_reason: z.string().nullable(),
});

const aiTaglineSchema = z.object({
  tagline: z.string().trim().min(4).max(100),
});

export type AiSlopMetadata = z.infer<typeof aiSlopMetadataSchema>;

export function parseAiMetadataText(text: string): AiSlopMetadata {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude response did not contain JSON.");
  }

  return aiSlopMetadataSchema.parse(JSON.parse(jsonMatch[0]));
}

export function parseAiTaglineText(text: string): string {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Claude response did not contain tagline JSON.");
  }

  return aiTaglineSchema.parse(JSON.parse(jsonMatch[0])).tagline;
}

export function fallbackMetadataForUrl(url: string): AiSlopMetadata {
  const hostname = new URL(url).hostname.replace(/^www\./, "");
  return {
    tagline: `A suspiciously shipped AI thing from ${hostname}`,
    type: "demo",
    moderation_flag: false,
    moderation_reason: null,
  };
}

export function fallbackReslopTagline(input: { title: string; url: string }): string {
  const hostname = new URL(input.url).hostname.replace(/^www\./, "");
  const title = input.title.length > 42 ? `${input.title.slice(0, 39)}...` : input.title;
  const tagline = `Second-pass slop polish for ${title} from ${hostname}`;

  return tagline.length > 100 ? `${tagline.slice(0, 97)}...` : tagline;
}

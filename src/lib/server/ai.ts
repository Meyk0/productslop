import "server-only";

import { zodTextFormat } from "openai/helpers/zod";
import {
  aiSlopMetadataSchema,
  aiTaglineSchema,
  fallbackMetadataForUrl,
  fallbackReslopTagline,
  type AiSlopMetadata,
} from "@/lib/domain/ai";
import type { Slop } from "@/lib/domain/slop";
import { getOpenAIClient } from "@/lib/server/clients";

export const defaultOpenAIModel = "gpt-5.4-mini";

export type GenerateMetadataInput = {
  url: string;
  title?: string;
  description?: string;
  screenshotUrl?: string;
};

export async function generateSlopMetadata(
  input: GenerateMetadataInput,
): Promise<AiSlopMetadata> {
  const client = getOpenAIClient();

  if (!client) {
    return fallbackMetadataForUrl(input.url);
  }

  const response = await client.responses.parse({
    model: openAIModel(),
    instructions: [
      "You generate Product Slop submission metadata.",
      "Return concise, funny metadata for an AI weekend project launch board that celebrates glorious slop.",
      "Tagline must be under 100 characters in irreverent AI weekend-project voice.",
      "Make the tagline feel like affectionate roast copy, not SaaS marketing.",
      "Use the word slop, slopped, or slop-adjacent language when it fits naturally.",
      "Prefer concrete jokes about wrappers, demos, vibes, agents, screenshots, or weekend shipping.",
      "Types: wrapper, tool, game, cursed, useless, demo.",
      "Set moderation_flag true for NSFW, hateful, scammy, phishing, malware, or rights-violating content.",
      "If moderation_flag is true, explain the reason briefly in moderation_reason.",
    ].join(" "),
    input: JSON.stringify(input),
    max_output_tokens: 420,
    reasoning: { effort: "low" },
    store: false,
    text: {
      format: zodTextFormat(aiSlopMetadataSchema, "slop_metadata"),
      verbosity: "low",
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI response did not match the slop metadata schema.");
  }

  return response.output_parsed;
}

export async function regenerateSlopTagline(
  slop: Pick<Slop, "url" | "title" | "tagline" | "type">,
): Promise<string> {
  const client = getOpenAIClient();

  if (!client) {
    return fallbackReslopTagline(slop);
  }

  const response = await client.responses.parse({
    model: openAIModel(),
    instructions: [
      "You rewrite Product Slop taglines.",
      "Return one punchy tagline under 100 characters.",
      "Make it funnier and more slop-forward than the current tagline.",
      "Use affectionate roast copy, not SaaS marketing.",
      "Use the word slop, slopped, or slop-adjacent language when it fits naturally.",
      "Do not include hateful, NSFW, scammy, phishing, or malware language.",
    ].join(" "),
    input: JSON.stringify({
      url: slop.url,
      title: slop.title,
      currentTagline: slop.tagline,
      type: slop.type,
    }),
    max_output_tokens: 180,
    reasoning: { effort: "low" },
    store: false,
    text: {
      format: zodTextFormat(aiTaglineSchema, "reslop_tagline"),
      verbosity: "low",
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI response did not match the tagline schema.");
  }

  return response.output_parsed.tagline;
}

export function openAIModel(): string {
  return process.env.OPENAI_MODEL?.trim() || defaultOpenAIModel;
}

import "server-only";

import {
  fallbackReslopTagline,
  fallbackMetadataForUrl,
  parseAiMetadataText,
  parseAiTaglineText,
  type AiSlopMetadata,
} from "@/lib/domain/ai";
import type { Slop } from "@/lib/domain/slop";
import { getAnthropicClient } from "@/lib/server/clients";

export type GenerateMetadataInput = {
  url: string;
  title?: string;
  description?: string;
  screenshotUrl?: string;
};

export async function generateSlopMetadata(
  input: GenerateMetadataInput,
): Promise<AiSlopMetadata> {
  const client = getAnthropicClient();

  if (!client) {
    return fallbackMetadataForUrl(input.url);
  }

  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
    max_tokens: 420,
    temperature: 0.8,
    system: [
      "You generate Product Slop submission metadata.",
      "Return only JSON with tagline, type, moderation_flag, moderation_reason.",
      "Tagline must be under 100 characters in irreverent AI weekend-project voice.",
      "Types: wrapper, tool, game, cursed, useless, demo.",
      "Flag NSFW, hateful, scammy, phishing, or malware content.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: JSON.stringify(input),
      },
    ],
  });

  const text = message.content.find((part) => part.type === "text")?.text;
  if (!text) {
    return fallbackMetadataForUrl(input.url);
  }

  return parseAiMetadataText(text);
}

export async function regenerateSlopTagline(
  slop: Pick<Slop, "url" | "title" | "tagline" | "type">,
): Promise<string> {
  const client = getAnthropicClient();

  if (!client) {
    return fallbackReslopTagline(slop);
  }

  const message = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-latest",
    max_tokens: 180,
    temperature: 0.95,
    system: [
      "You rewrite Product Slop taglines.",
      "Return only JSON with a single tagline field.",
      "Tagline must be under 100 characters, punchy, and in irreverent AI weekend-project voice.",
      "Do not include hateful, NSFW, scammy, phishing, or malware language.",
    ].join(" "),
    messages: [
      {
        role: "user",
        content: JSON.stringify({
          url: slop.url,
          title: slop.title,
          currentTagline: slop.tagline,
          type: slop.type,
        }),
      },
    ],
  });

  const text = message.content.find((part) => part.type === "text")?.text;
  if (!text) {
    return fallbackReslopTagline(slop);
  }

  return parseAiTaglineText(text);
}

import "server-only";

import { nanoid } from "nanoid";
import type { ReactionCounts, Slop } from "@/lib/domain/slop";
import { createEmptyReactionCounts, createSlug } from "@/lib/domain/slop";
import { parseSubmissionInput, type SubmissionInput } from "@/lib/domain/validation";
import { applyReaction } from "@/lib/domain/reactions";
import { generateSlopMetadata } from "@/lib/server/ai";
import { seedSlops } from "@/lib/data/mock-slops";
import { sendMagicLinkEmail } from "@/lib/server/email";
import { fetchProjectMetadata } from "@/lib/server/microlink";

let runtimeSlops: Slop[] = seedSlops.map((slop) => ({
  ...slop,
  reactionCounts: { ...slop.reactionCounts },
}));

const reactionLedger = new Set<string>();

export async function listSlops(): Promise<Slop[]> {
  return runtimeSlops.filter((slop) => !slop.deletedAt);
}

export async function getSlopBySlug(slug: string): Promise<Slop | undefined> {
  return runtimeSlops.find((slop) => slop.slug === slug && !slop.deletedAt);
}

export async function createSlopFromUnknown(input: unknown): Promise<Slop> {
  const parsed = parseSubmissionInput(input);

  if (!parsed.ok) {
    throw new Error(parsed.message);
  }

  return createSlop(parsed.data);
}

export async function createSlop(input: SubmissionInput): Promise<Slop> {
  const projectMetadata = await fetchProjectMetadata(input.url);
  const metadata = await generateSlopMetadata({
    url: input.url,
    title: projectMetadata.title,
    description: projectMetadata.description,
    screenshotUrl: projectMetadata.screenshotUrl,
  });

  if (metadata.moderation_flag) {
    throw new Error(metadata.moderation_reason ?? "That slop is not launchable.");
  }

  const id = nanoid();
  const url = new URL(input.url);
  const title = projectMetadata.title?.trim() || titleFromHostname(url.hostname);
  const slop: Slop = {
    id,
    slug: createSlug(title, id),
    url: input.url,
    title,
    tagline: metadata.tagline,
    screenshotUrl: projectMetadata.screenshotUrl,
    type: metadata.type,
    slopperHandle: input.slopperHandle,
    email: input.email,
    manageToken: input.email ? nanoid(32) : undefined,
    reslopUsed: false,
    founding: runtimeSlops.length < 50,
    createdAt: new Date().toISOString(),
    reactionCounts: createEmptyReactionCounts(),
  };

  runtimeSlops = [slop, ...runtimeSlops];
  try {
    await sendMagicLinkEmail(slop);
  } catch (error) {
    console.error("Failed to send Product Slop magic link", error);
  }

  return slop;
}

export async function recordReaction(params: {
  slug: string;
  reactionType: string;
  sessionId: string;
}): Promise<{ counts: ReactionCounts; changed: boolean }> {
  const slop = await getSlopBySlug(params.slug);

  if (!slop) {
    throw new Error("Slop not found.");
  }

  const result = applyReaction(slop, params.reactionType, params.sessionId, reactionLedger);

  if (!result.ok) {
    throw new Error(result.message);
  }

  return {
    counts: result.counts,
    changed: result.changed,
  };
}

export async function getReactionCounts(slug: string): Promise<ReactionCounts> {
  const slop = await getSlopBySlug(slug);
  return slop?.reactionCounts ?? createEmptyReactionCounts();
}

export function titleFromHostname(hostname: string): string {
  return (
    hostname
      .replace(/^www\./, "")
      .split(".")[0]
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
      .join(" ") || "Untitled Slop"
  );
}

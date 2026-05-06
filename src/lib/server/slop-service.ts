import "server-only";

import { randomUUID } from "node:crypto";
import { nanoid } from "nanoid";
import type { ReactionCounts, Slop } from "@/lib/domain/slop";
import { createEmptyReactionCounts, createSlug } from "@/lib/domain/slop";
import {
  previousUtcDateKey,
  selectSlopOfTheDay,
  type SlopOfTheDaySelection,
} from "@/lib/domain/slop-of-the-day";
import { parseSubmissionInput, type SubmissionInput } from "@/lib/domain/validation";
import { parseTagline } from "@/lib/domain/manage";
import { getSupabaseAdminClient } from "@/lib/server/clients";
import { generateSlopMetadata, regenerateSlopTagline } from "@/lib/server/ai";
import { assertSlopCopySafe, assertSubmissionPreflight } from "@/lib/server/abuse";
import { sendMagicLinkEmail } from "@/lib/server/email";
import { fetchProjectMetadata } from "@/lib/server/microlink";
import {
  getSlopBySlugFromSupabase,
  getSlopByManageTokenFromSupabase,
  insertReactionIntoSupabase,
  insertSlopIntoSupabase,
  listSlopOfTheDayFromSupabase,
  listSlopsFromSupabase,
  reslopSlopInSupabase,
  softDeleteSlopInSupabase,
  updateSlopTaglineInSupabase,
  upsertSlopOfTheDayInSupabase,
} from "@/lib/server/supabase-store";
import {
  getLocalSlopByManageToken,
  getLocalSlopBySlug,
  insertLocalReaction,
  insertLocalSlop,
  listLocalSlopOfTheDay,
  listLocalSlops,
  reslopLocalSlop,
  softDeleteLocalSlop,
  updateLocalSlopTagline,
  upsertLocalSlopOfTheDay,
} from "@/lib/server/local-store";

export type SlopOfTheDay = SlopOfTheDaySelection;

export async function listSlops(): Promise<Slop[]> {
  const client = getSupabaseAdminClient();
  if (client) {
    return listSlopsFromSupabase(client);
  }

  return listLocalSlops();
}

export async function getSlopBySlug(slug: string): Promise<Slop | undefined> {
  const client = getSupabaseAdminClient();
  if (client) {
    return getSlopBySlugFromSupabase(client, slug);
  }

  return getLocalSlopBySlug(slug);
}

export async function getSlopByManageToken(token: string): Promise<Slop | undefined> {
  const client = getSupabaseAdminClient();
  if (client) {
    return getSlopByManageTokenFromSupabase(client, token);
  }

  return getLocalSlopByManageToken(token);
}

export async function createSlopFromUnknown(input: unknown): Promise<Slop> {
  const parsed = parseSubmissionInput(input);

  if (!parsed.ok) {
    throw new Error(parsed.message);
  }

  return createSlop(parsed.data);
}

export async function createSlop(input: SubmissionInput): Promise<Slop> {
  await assertSubmissionPreflight({
    url: input.url,
    email: input.email,
  });

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

  const client = getSupabaseAdminClient();
  const id = client ? randomUUID() : nanoid();
  const existingSlops = client ? [] : await listLocalSlops();
  const url = new URL(input.url);
  const title = projectMetadata.title?.trim() || titleFromHostname(url.hostname);

  assertSlopCopySafe({
    title,
    tagline: metadata.tagline,
  });

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
    manageToken: nanoid(32),
    reslopUsed: false,
    founding: client ? false : existingSlops.length < 50,
    createdAt: new Date().toISOString(),
    reactionCounts: createEmptyReactionCounts(),
  };

  const savedSlop = client ? await insertSlopIntoSupabase(client, slop) : await insertLocalSlop(slop);

  try {
    await sendMagicLinkEmail(savedSlop);
  } catch (error) {
    console.error("Failed to send Product Slop magic link", error);
  }

  return savedSlop;
}

export async function recordReaction(params: {
  slug: string;
  reactionType: string;
  sessionId: string;
  ipHash?: string;
}): Promise<{ counts: ReactionCounts; changed: boolean }> {
  const slop = await getSlopBySlug(params.slug);

  if (!slop) {
    throw new Error("Slop not found.");
  }

  const client = getSupabaseAdminClient();
  if (client) {
    return insertReactionIntoSupabase(client, {
      slopId: slop.id,
      reactionType: params.reactionType,
      sessionId: params.sessionId,
      ipHash: params.ipHash,
    });
  }

  return insertLocalReaction({
    slopId: slop.id,
    reactionType: params.reactionType,
    sessionId: params.sessionId,
  });
}

export async function getReactionCounts(slug: string): Promise<ReactionCounts> {
  const slop = await getSlopBySlug(slug);
  return slop?.reactionCounts ?? createEmptyReactionCounts();
}

export async function listSlopOfTheDayWinners(): Promise<SlopOfTheDay[]> {
  const client = getSupabaseAdminClient();
  if (client) {
    return listSlopOfTheDayFromSupabase(client);
  }

  return listLocalSlopOfTheDay();
}

export async function getLatestSlopOfTheDay(): Promise<SlopOfTheDay | undefined> {
  return (await listSlopOfTheDayWinners())[0];
}

export async function calculateSlopOfTheDay(
  dateKey = previousUtcDateKey(),
): Promise<SlopOfTheDay | null> {
  const winner = selectSlopOfTheDay(await listSlops(), dateKey);
  if (!winner) {
    return null;
  }

  const client = getSupabaseAdminClient();
  return client
    ? upsertSlopOfTheDayInSupabase(client, winner)
    : upsertLocalSlopOfTheDay(winner);
}

export async function updateSlopTaglineByToken(
  token: string,
  rawTagline: unknown,
): Promise<Slop> {
  const parsed = parseTagline(rawTagline);
  if (!parsed.ok) {
    throw new Error(parsed.message);
  }

  const client = getSupabaseAdminClient();
  if (client) {
    const updated = await updateSlopTaglineInSupabase(client, {
      token,
      tagline: parsed.tagline,
    });

    if (!updated) {
      throw new Error("Magic link not found.");
    }

    return updated;
  }

  const slop = await updateLocalSlopTagline(token, parsed.tagline);
  if (!slop) {
    throw new Error("Magic link not found.");
  }
  return slop;
}

export async function deleteSlopByToken(token: string): Promise<void> {
  const client = getSupabaseAdminClient();
  if (client) {
    const deleted = await softDeleteSlopInSupabase(client, token);
    if (!deleted) {
      throw new Error("Magic link not found.");
    }

    return;
  }

  const deleted = await softDeleteLocalSlop(token);
  if (!deleted) {
    throw new Error("Magic link not found.");
  }
}

export async function reslopByToken(token: string, expectedSlug?: string): Promise<Slop> {
  const slop = await getSlopByManageToken(token);
  if (!slop) {
    throw new Error("Magic link not found.");
  }

  if (expectedSlug && slop.slug !== expectedSlug) {
    throw new Error("Magic link not found.");
  }

  if (slop.reslopUsed) {
    throw new Error("Reslop already used.");
  }

  const tagline = await regenerateSlopTagline(slop);
  const client = getSupabaseAdminClient();

  if (client) {
    const updated = await reslopSlopInSupabase(client, { token, tagline });
    if (!updated) {
      throw new Error("Reslop already used.");
    }

    return updated;
  }

  const updated = await reslopLocalSlop(token, tagline);
  if (!updated) {
    throw new Error("Reslop already used.");
  }

  return updated;
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

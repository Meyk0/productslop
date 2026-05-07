import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ReactionCounts, Slop } from "@/lib/domain/slop";
import { createEmptyReactionCounts, isReactionType } from "@/lib/domain/slop";
import { canonicalizeSubmissionUrl } from "@/lib/domain/canonical-url";
import { applyReaction, reactionLedgerKey } from "@/lib/domain/reactions";
import { retiredSeedSlugs, seedSlops } from "@/lib/data/mock-slops";

export type StoredSlopOfTheDay = {
  date: string;
  slop: Slop;
  totalReactions: number;
};

type LocalStore = {
  slops: Slop[];
  reactionLedger: string[];
  slopOfTheDay: Array<{
    date: string;
    slopId: string;
    totalReactions: number;
  }>;
};

const storePath = path.join(process.cwd(), ".data", "local-store.json");

export async function listLocalSlops(): Promise<Slop[]> {
  const store = await readLocalStore();
  return store.slops.filter((slop) => !slop.deletedAt);
}

export async function getLocalSlopBySlug(slug: string): Promise<Slop | undefined> {
  const store = await readLocalStore();
  return store.slops.find((slop) => slop.slug === slug && !slop.deletedAt);
}

export async function getLocalSlopByManageToken(token: string): Promise<Slop | undefined> {
  const store = await readLocalStore();
  return store.slops.find((slop) => slop.manageToken === token && !slop.deletedAt);
}

export async function getLocalSlopByCanonicalUrl(
  canonicalUrl: string,
): Promise<Slop | undefined> {
  const store = await readLocalStore();
  return store.slops.find(
    (slop) => !slop.deletedAt && slopCanonicalUrl(slop) === canonicalUrl,
  );
}

export async function insertLocalSlop(slop: Slop): Promise<Slop> {
  const store = await readLocalStore();
  store.slops = [slop, ...store.slops];
  await writeLocalStore(store);
  return slop;
}

export async function updateLocalSlopTagline(
  token: string,
  tagline: string,
): Promise<Slop | undefined> {
  const store = await readLocalStore();
  const slop = store.slops.find((candidate) => candidate.manageToken === token && !candidate.deletedAt);

  if (!slop) {
    return undefined;
  }

  slop.tagline = tagline;
  await writeLocalStore(store);
  return slop;
}

export async function reslopLocalSlop(
  token: string,
  tagline: string,
): Promise<Slop | undefined> {
  const store = await readLocalStore();
  const slop = store.slops.find(
    (candidate) =>
      candidate.manageToken === token && !candidate.deletedAt && !candidate.reslopUsed,
  );

  if (!slop) {
    return undefined;
  }

  slop.tagline = tagline;
  slop.reslopUsed = true;
  await writeLocalStore(store);
  return slop;
}

export async function softDeleteLocalSlop(token: string): Promise<boolean> {
  const store = await readLocalStore();
  const slop = store.slops.find((candidate) => candidate.manageToken === token && !candidate.deletedAt);

  if (!slop) {
    return false;
  }

  slop.deletedAt = new Date().toISOString();
  await writeLocalStore(store);
  return true;
}

export async function softDeleteLocalSlopBySlug(slug: string): Promise<boolean> {
  const store = await readLocalStore();
  const slop = store.slops.find((candidate) => candidate.slug === slug && !candidate.deletedAt);

  if (!slop) {
    return false;
  }

  slop.deletedAt = new Date().toISOString();
  await writeLocalStore(store);
  return true;
}

export async function insertLocalReaction(params: {
  slopId: string;
  reactionType: string;
  sessionId: string;
}): Promise<{ counts: ReactionCounts; changed: boolean }> {
  const store = await readLocalStore();
  const slop = store.slops.find((candidate) => candidate.id === params.slopId && !candidate.deletedAt);

  if (!slop) {
    throw new Error("Slop not found.");
  }

  if (!isReactionType(params.reactionType)) {
    throw new Error("Unknown reaction.");
  }

  const ledger = new Set(store.reactionLedger);
  const result = applyReaction(slop, params.reactionType, params.sessionId, ledger);

  if (!result.ok) {
    throw new Error(result.message);
  }

  if (result.changed) {
    store.reactionLedger.push(reactionLedgerKey(slop.id, params.reactionType, params.sessionId));
    await writeLocalStore(store);
  }

  return {
    changed: result.changed,
    counts: result.counts,
  };
}

export async function listLocalSlopOfTheDay(): Promise<StoredSlopOfTheDay[]> {
  const store = await readLocalStore();
  return store.slopOfTheDay
    .toSorted((left, right) => right.date.localeCompare(left.date))
    .flatMap((winner) => {
      const slop = store.slops.find(
        (candidate) => candidate.id === winner.slopId && !candidate.deletedAt,
      );

      return slop
        ? [
            {
              date: winner.date,
              slop,
              totalReactions: winner.totalReactions,
            },
          ]
        : [];
    });
}

export async function upsertLocalSlopOfTheDay(
  winner: StoredSlopOfTheDay,
): Promise<StoredSlopOfTheDay> {
  const store = await readLocalStore();
  const existingIndex = store.slopOfTheDay.findIndex((entry) => entry.date === winner.date);
  const entry = {
    date: winner.date,
    slopId: winner.slop.id,
    totalReactions: winner.totalReactions,
  };

  if (existingIndex === -1) {
    store.slopOfTheDay.push(entry);
  } else {
    store.slopOfTheDay[existingIndex] = entry;
  }

  await writeLocalStore(store);
  return winner;
}

async function readLocalStore(): Promise<LocalStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    return mergeMissingSeedSlops({
      slops: normalizeSlops(parsed.slops).filter((slop) => !retiredSeedSlugs.has(slop.slug)),
      reactionLedger: Array.isArray(parsed.reactionLedger) ? parsed.reactionLedger : [],
      slopOfTheDay: normalizeSlopOfTheDay(parsed.slopOfTheDay),
    });
  } catch {
    const initialStore = {
      slops: seedSlops.map(cloneSeedSlop),
      reactionLedger: [],
      slopOfTheDay: [],
    };
    await tryWriteInitialStore(initialStore);
    return initialStore;
  }
}

async function mergeMissingSeedSlops(store: LocalStore): Promise<LocalStore> {
  const existingSlugs = new Set(store.slops.map((slop) => slop.slug));
  const missingSeeds = seedSlops
    .filter((slop) => !existingSlugs.has(slop.slug))
    .map(cloneSeedSlop);

  if (missingSeeds.length === 0) {
    return store;
  }

  const mergedStore = {
    ...store,
    slops: [...missingSeeds, ...store.slops],
  };

  try {
    await writeLocalStore(mergedStore);
  } catch (error) {
    console.warn("Unable to persist updated local Product Slop store", error);
  }

  return mergedStore;
}

function cloneSeedSlop(slop: Slop): Slop {
  return {
    ...slop,
    reactionCounts: { ...slop.reactionCounts },
  };
}

async function writeLocalStore(store: LocalStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2));
}

async function tryWriteInitialStore(store: LocalStore) {
  try {
    await writeLocalStore(store);
  } catch (error) {
    console.warn("Unable to persist initial local Product Slop store", error);
  }
}

function normalizeSlops(slops: unknown): Slop[] {
  if (!Array.isArray(slops)) {
    return [];
  }

    return slops.map((slop) => ({
      ...(slop as Slop),
      canonicalUrl: (slop as Slop).canonicalUrl ?? canonicalizeSubmissionUrl((slop as Slop).url),
      reslopUsed: (slop as Slop).reslopUsed ?? false,
      reactionCounts: {
      ...createEmptyReactionCounts(),
      ...(slop as Slop).reactionCounts,
    },
  }));
}

function normalizeSlopOfTheDay(slops: unknown): LocalStore["slopOfTheDay"] {
  if (!Array.isArray(slops)) {
    return [];
  }

  return slops.flatMap((winner) => {
    const candidate = winner as Partial<LocalStore["slopOfTheDay"][number]>;
    if (
      typeof candidate.date !== "string" ||
      typeof candidate.slopId !== "string" ||
      typeof candidate.totalReactions !== "number"
    ) {
      return [];
    }

    return [
      {
        date: candidate.date,
        slopId: candidate.slopId,
        totalReactions: candidate.totalReactions,
      },
    ];
  });
}

function slopCanonicalUrl(slop: Slop): string {
  return slop.canonicalUrl ?? canonicalizeSubmissionUrl(slop.url);
}

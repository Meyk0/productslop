import "server-only";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ReactionCounts, Slop } from "@/lib/domain/slop";
import { createEmptyReactionCounts, isReactionType } from "@/lib/domain/slop";
import { applyReaction, reactionLedgerKey } from "@/lib/domain/reactions";
import { seedSlops } from "@/lib/data/mock-slops";

type LocalStore = {
  slops: Slop[];
  reactionLedger: string[];
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

async function readLocalStore(): Promise<LocalStore> {
  try {
    const raw = await readFile(storePath, "utf8");
    const parsed = JSON.parse(raw) as Partial<LocalStore>;
    return {
      slops: normalizeSlops(parsed.slops),
      reactionLedger: Array.isArray(parsed.reactionLedger) ? parsed.reactionLedger : [],
    };
  } catch {
    const initialStore = {
      slops: seedSlops.map((slop) => ({
        ...slop,
        reactionCounts: { ...slop.reactionCounts },
      })),
      reactionLedger: [],
    };
    await writeLocalStore(initialStore);
    return initialStore;
  }
}

async function writeLocalStore(store: LocalStore) {
  await mkdir(path.dirname(storePath), { recursive: true });
  await writeFile(storePath, JSON.stringify(store, null, 2));
}

function normalizeSlops(slops: unknown): Slop[] {
  if (!Array.isArray(slops)) {
    return [];
  }

  return slops.map((slop) => ({
    ...(slop as Slop),
    reslopUsed: (slop as Slop).reslopUsed ?? false,
    reactionCounts: {
      ...createEmptyReactionCounts(),
      ...(slop as Slop).reactionCounts,
    },
  }));
}

import type { ReactionCounts, ReactionType, Slop } from "@/lib/domain/slop";
import { isReactionType } from "@/lib/domain/slop";

export type ReactionLedger = Set<string>;

export type ReactionResult =
  | { ok: true; changed: boolean; counts: ReactionCounts }
  | { ok: false; message: string };

export function reactionLedgerKey(
  slopId: string,
  reactionType: ReactionType,
  sessionId: string,
): string {
  return `${slopId}:${reactionType}:${sessionId}`;
}

export function applyReaction(
  slop: Slop,
  rawReactionType: string,
  sessionId: string,
  ledger: ReactionLedger,
): ReactionResult {
  if (!isReactionType(rawReactionType)) {
    return { ok: false, message: "Unknown reaction." };
  }

  const key = reactionLedgerKey(slop.id, rawReactionType, sessionId);
  if (ledger.has(key)) {
    return { ok: true, changed: false, counts: { ...slop.reactionCounts } };
  }

  ledger.add(key);
  slop.reactionCounts = {
    ...slop.reactionCounts,
    [rawReactionType]: slop.reactionCounts[rawReactionType] + 1,
  };

  return { ok: true, changed: true, counts: { ...slop.reactionCounts } };
}

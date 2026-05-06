"use client";

import { useMemo, useState } from "react";
import { requestTurnstileToken } from "@/lib/client/turnstile";
import {
  REACTION_TYPES,
  totalReactions,
  type ReactionCounts,
  type Slop,
} from "@/lib/domain/slop";

export function ReactionMenu({
  slop,
  turnstileSiteKey,
}: {
  slop: Slop;
  turnstileSiteKey?: string;
}) {
  const [counts, setCounts] = useState<ReactionCounts>(slop.reactionCounts);
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [pendingReaction, setPendingReaction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const total = useMemo(() => totalReactions({ reactionCounts: counts }), [counts]);

  async function react(reactionType: string) {
    if (used.has(reactionType) || pendingReaction) {
      return;
    }

    const previousCounts = counts;
    setPendingReaction(reactionType);
    setError(null);

    try {
      const turnstileToken = await requestTurnstileToken(turnstileSiteKey, "reaction");

      setUsed((current) => new Set(current).add(reactionType));
      setCounts((current) => ({
        ...current,
        [reactionType]: current[reactionType as keyof ReactionCounts] + 1,
      }));

      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: slop.slug, reactionType, turnstileToken }),
      });
      const data = (await response.json()) as { counts?: ReactionCounts; error?: string };

      if (!response.ok || !data.counts) {
        throw new Error(data.error ?? "Unable to react.");
      }

      setCounts(data.counts);
    } catch (caught) {
      setUsed((current) => {
        const next = new Set(current);
        next.delete(reactionType);
        return next;
      });
      setCounts(previousCounts);
      setError(caught instanceof Error ? caught.message : "Unable to react.");
    } finally {
      setPendingReaction(null);
    }
  }

  return (
    <section className="rounded-[8px] border border-line bg-panel p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black">Reaction menu</h2>
          <p className="text-sm text-muted">Session-limited to one tap per reaction.</p>
        </div>
        <div className="rounded-full bg-slop-cream px-4 py-2 font-mono text-sm font-black text-slop-orange">
          {total}
        </div>
      </div>

      {error ? (
        <p className="mt-3 rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {error}
        </p>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {REACTION_TYPES.map((reaction) => {
          const alreadyUsed = used.has(reaction.id);
          const isWorking = pendingReaction === reaction.id;

          return (
            <button
              key={reaction.id}
              type="button"
              onClick={() => react(reaction.id)}
              disabled={alreadyUsed || Boolean(pendingReaction)}
              className="group min-h-16 rounded-[8px] border border-line bg-white px-4 py-3 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:border-slop-orange enabled:hover:shadow-sm disabled:bg-slate-50"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-bold text-foreground">{reaction.label}</span>
                <span className="font-mono text-sm font-bold text-muted">
                  {counts[reaction.id]}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                {isWorking ? "checking..." : reaction.vibe}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

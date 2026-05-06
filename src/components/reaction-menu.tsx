"use client";

import { useMemo, useState, useTransition } from "react";
import {
  REACTION_TYPES,
  totalReactions,
  type ReactionCounts,
  type Slop,
} from "@/lib/domain/slop";

export function ReactionMenu({ slop }: { slop: Slop }) {
  const [counts, setCounts] = useState<ReactionCounts>(slop.reactionCounts);
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [pendingReaction, setPendingReaction] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const total = useMemo(() => totalReactions({ reactionCounts: counts }), [counts]);

  function react(reactionType: string) {
    if (used.has(reactionType)) {
      return;
    }

    setUsed((current) => new Set(current).add(reactionType));
    setCounts((current) => ({
      ...current,
      [reactionType]: current[reactionType as keyof ReactionCounts] + 1,
    }));
    setPendingReaction(reactionType);

    startTransition(async () => {
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: slop.slug, reactionType }),
      });

      if (response.ok) {
        const data = (await response.json()) as { counts: ReactionCounts };
        setCounts(data.counts);
      }

      setPendingReaction(null);
    });
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

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {REACTION_TYPES.map((reaction) => {
          const alreadyUsed = used.has(reaction.id);
          const isWorking = isPending && pendingReaction === reaction.id;

          return (
            <button
              key={reaction.id}
              type="button"
              onClick={() => react(reaction.id)}
              disabled={alreadyUsed}
              className="group min-h-16 rounded-[8px] border border-line bg-white px-4 py-3 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:border-slop-orange enabled:hover:shadow-sm disabled:bg-slate-50"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-bold text-foreground">{reaction.label}</span>
                <span className="font-mono text-sm font-bold text-muted">
                  {counts[reaction.id]}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                {isWorking ? "counting..." : reaction.vibe}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

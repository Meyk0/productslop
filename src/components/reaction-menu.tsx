"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/client/analytics";
import { requestTurnstileToken } from "@/lib/client/turnstile";
import {
  REACTION_TYPES,
  totalReactions,
  type ReactionCounts,
  type Slop,
} from "@/lib/domain/slop";

type ReactionSlop = Pick<Slop, "slug" | "reactionCounts">;

type ConfettiStyle = CSSProperties & {
  "--confetti-x": string;
  "--confetti-y": string;
  "--confetti-rotation": string;
  "--confetti-color": string;
  "--confetti-delay": string;
};

const confettiColors = ["#da552f", "#1f2430", "#16a34a", "#f59e0b", "#2563eb", "#e11d48"];

export function ReactionMenu({
  slop,
  turnstileSiteKey,
}: {
  slop: ReactionSlop;
  turnstileSiteKey?: string;
}) {
  const [counts, setCounts] = useState<ReactionCounts>(slop.reactionCounts);
  const [used, setUsed] = useState<Set<string>>(() => new Set());
  const [pendingReaction, setPendingReaction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [burst, setBurst] = useState<{ id: number } | null>(null);
  const burstIdRef = useRef(0);
  const burstTimerRef = useRef<number | null>(null);
  const total = useMemo(() => totalReactions({ reactionCounts: counts }), [counts]);

  useEffect(() => {
    return () => {
      if (burstTimerRef.current) {
        window.clearTimeout(burstTimerRef.current);
      }
    };
  }, []);

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
      trackEvent("reaction_click", { reaction_type: reactionType, slug: slop.slug });
      const burstId = burstIdRef.current + 1;
      burstIdRef.current = burstId;
      setBurst({ id: burstId });
      if (burstTimerRef.current) {
        window.clearTimeout(burstTimerRef.current);
      }
      burstTimerRef.current = window.setTimeout(() => {
        setBurst((current) => (current?.id === burstId ? null : current));
      }, 950);
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
    <section className="relative overflow-hidden rounded-[8px] border border-line bg-panel p-4">
      {burst ? (
        <div
          key={burst.id}
          className="pointer-events-none absolute inset-0 z-10 overflow-hidden"
          aria-hidden="true"
        >
          {Array.from({ length: 22 }, (_, index) => (
            <span key={index} className="confetti-bit" style={confettiStyle(index)} />
          ))}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-black uppercase text-slop-orange">
            Slop reactor
          </p>
          <h2 className="mt-1 text-xl font-black">Tap the chaos meter</h2>
          <p className="text-sm text-muted">
            One tap per reaction. Multiple bad opinions encouraged.
          </p>
        </div>
        <div className="rounded-[8px] bg-slop-cream px-4 py-2 text-center font-mono text-sm font-black text-slop-orange">
          <span className="block text-[10px] uppercase tracking-normal">chaos</span>
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
              className="group min-h-20 rounded-[8px] border border-line bg-white px-4 py-3 text-left transition enabled:hover:-translate-y-0.5 enabled:hover:border-slop-orange enabled:hover:bg-slop-cream enabled:hover:shadow-sm disabled:bg-slate-50"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="font-bold text-foreground">{reaction.label}</span>
                <span className="rounded-full bg-slate-100 px-2 py-1 font-mono text-xs font-black text-muted">
                  {counts[reaction.id]}
                </span>
              </span>
              <span className="mt-1 block text-xs leading-5 text-muted">
                {alreadyUsed ? "logged in the slop ledger" : isWorking ? "consulting the vibe desk..." : reaction.vibe}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function confettiStyle(index: number): ConfettiStyle {
  const angle = (index / 22) * Math.PI * 2;
  const distance = 72 + (index % 5) * 18;

  return {
    "--confetti-x": `${Math.cos(angle) * distance}px`,
    "--confetti-y": `${Math.sin(angle) * distance - 24}px`,
    "--confetti-rotation": `${index * 43}deg`,
    "--confetti-color": confettiColors[index % confettiColors.length],
    "--confetti-delay": `${(index % 4) * 24}ms`,
  };
}

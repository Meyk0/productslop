"use client";

import { useMemo, useState } from "react";
import { LoaderCircle, RefreshCcw, Send } from "lucide-react";
import { TradingCard } from "@/components/trading-card";
import type { Slop } from "@/lib/domain/slop";

const loadingCopy = [
  "yapping at Claude...",
  "counting strawberries...",
  "hallucinating tagline...",
  "checking if this is a wrapper...",
];

export function SubmitForm() {
  const [startedAt] = useState(() => Date.now());
  const [status, setStatus] = useState<"idle" | "loading" | "revealed">("idle");
  const [error, setError] = useState<string | null>(null);
  const [slop, setSlop] = useState<Slop | null>(null);
  const [copyIndex, setCopyIndex] = useState(0);
  const loadingLine = useMemo(() => loadingCopy[copyIndex % loadingCopy.length], [copyIndex]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError(null);
    setCopyIndex((index) => index + 1);

    const formData = new FormData(event.currentTarget);
    const spinner = window.setInterval(() => {
      setCopyIndex((index) => index + 1);
    }, 800);

    try {
      const response = await fetch("/api/slops", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });

      const data = (await response.json()) as { slop?: Slop; error?: string };

      if (!response.ok || !data.slop) {
        throw new Error(data.error ?? "The slop machine jammed.");
      }

      setSlop(data.slop);
      setStatus("revealed");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The slop machine jammed.");
      setStatus("idle");
    } finally {
      window.clearInterval(spinner);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(340px,1fr)]">
      <form onSubmit={submit} className="rounded-[8px] border border-line bg-white p-5 sm:p-6">
        <input type="hidden" name="startedAt" value={startedAt} />
        <input
          aria-hidden="true"
          tabIndex={-1}
          name="honeypot"
          className="hidden"
          autoComplete="off"
        />

        <label className="block">
          <span className="text-sm font-black uppercase text-muted">Paste your slop URL</span>
          <input
            name="url"
            type="url"
            required
            placeholder="https://your-weekend-build.ai"
            className="mt-3 h-14 w-full rounded-[8px] border border-line px-4 text-lg font-semibold outline-none transition focus:border-slop-orange focus:ring-4 focus:ring-orange-100"
          />
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black uppercase text-muted">Email, optional</span>
            <input
              name="email"
              type="email"
              placeholder="for edit/delete link"
              className="mt-2 h-12 w-full rounded-[8px] border border-line px-4 outline-none transition focus:border-slop-orange focus:ring-4 focus:ring-orange-100"
            />
          </label>
          <label className="block">
            <span className="text-sm font-black uppercase text-muted">Slopper handle</span>
            <input
              name="slopperHandle"
              placeholder="@you"
              className="mt-2 h-12 w-full rounded-[8px] border border-line px-4 outline-none transition focus:border-slop-orange focus:ring-4 focus:ring-orange-100"
            />
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={status === "loading"}
          className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-slop-orange px-5 font-black text-white transition hover:bg-slop-orange-strong disabled:cursor-wait disabled:opacity-75"
        >
          {status === "loading" ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              {loadingLine}
            </>
          ) : (
            <>
              <Send className="size-5" />
              Submit slop
            </>
          )}
        </button>

        <p className="mt-4 text-sm leading-6 text-muted">
          Turnstile, Microlink, Supabase, and Resend are environment-backed
          integration points. Local development uses a temporary in-memory store.
        </p>
      </form>

      <div className="min-h-[420px]">
        {slop ? (
          <TradingCard slop={slop} />
        ) : (
          <div className="grid min-h-[420px] place-items-center rounded-[8px] border border-dashed border-line bg-white p-8 text-center">
            <div>
              <RefreshCcw className="mx-auto size-10 text-slop-orange" />
              <h2 className="mt-4 text-2xl font-black">Trading card reveal waits here</h2>
              <p className="mt-2 max-w-sm text-muted">
                Submit a URL and the local fallback will mint a public card.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

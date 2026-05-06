"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, LoaderCircle, RefreshCcw, Send, Share2, Sparkles } from "lucide-react";
import { TradingCard } from "@/components/trading-card";
import { buildLinkedInShareUrl, buildProjectUrl, buildXShareUrl } from "@/lib/domain/share";
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
  const [reslopStatus, setReslopStatus] = useState<"idle" | "loading">("idle");
  const [error, setError] = useState<string | null>(null);
  const [slop, setSlop] = useState<Slop | null>(null);
  const [copyIndex, setCopyIndex] = useState(0);
  const loadingLine = useMemo(() => loadingCopy[copyIndex % loadingCopy.length], [copyIndex]);
  const projectUrl = slop
    ? buildProjectUrl(
        typeof window === "undefined" ? "http://localhost:3000" : window.location.origin,
        slop.slug,
      )
    : "";
  const xShareUrl = slop
    ? buildXShareUrl({ projectUrl, tagline: slop.tagline })
    : "https://twitter.com/intent/tweet";
  const linkedInShareUrl = slop
    ? buildLinkedInShareUrl(projectUrl)
    : "https://www.linkedin.com/sharing/share-offsite/";

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

  async function reslopTagline() {
    if (!slop?.manageToken || slop.reslopUsed) {
      return;
    }

    setReslopStatus("loading");
    setError(null);

    try {
      const response = await fetch(`/api/slops/${slop.slug}/reslop`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ manageToken: slop.manageToken }),
      });
      const data = (await response.json()) as { slop?: Slop; error?: string };

      if (!response.ok || !data.slop) {
        throw new Error(data.error ?? "The reslop button ran out of vibes.");
      }

      setSlop(data.slop);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "The reslop button ran out of vibes.");
    } finally {
      setReslopStatus("idle");
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
          integration points. Local development uses a file-backed fallback store.
        </p>
      </form>

      <div className="min-h-[420px]">
        {slop ? (
          <div className="card-reveal">
            <TradingCard slop={slop} />
            <div className="mt-4 rounded-[8px] border border-line bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-black uppercase text-slop-orange">
                    Card minted
                  </p>
                  <h2 className="mt-1 text-xl font-black">Ship the link around</h2>
                </div>
                {slop.email ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    Manage link emailed
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={reslopTagline}
                  disabled={!slop.manageToken || slop.reslopUsed || reslopStatus === "loading"}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-black transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-55"
                >
                  {reslopStatus === "loading" ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    <RefreshCcw className="size-4" />
                  )}
                  {slop.reslopUsed ? "Reslop used" : "Reslop tagline"}
                </button>

                <Link
                  href={`/p/${slop.slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-sm font-black text-white transition hover:bg-black"
                >
                  Public page
                  <ExternalLink className="size-4" />
                </Link>

                <a
                  href={xShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-black transition hover:border-slate-300"
                >
                  <Sparkles className="size-4" />
                  Share to X
                </a>

                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-black transition hover:border-slate-300"
                >
                  <Share2 className="size-4" />
                  Share to LinkedIn
                </a>
              </div>

              {slop.manageToken ? (
                <Link
                  href={`/manage/${slop.manageToken}`}
                  className="mt-3 inline-flex text-sm font-bold text-slop-orange hover:text-slop-orange-strong"
                >
                  Edit or delete this launch
                </Link>
              ) : null}
            </div>
          </div>
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

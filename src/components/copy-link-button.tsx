"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { trackEvent } from "@/lib/client/analytics";

type CopyState = "idle" | "copied" | "failed";

export function CopyLinkButton({
  url,
  slug,
  source,
  className,
  children = "Copy link",
}: {
  url: string;
  slug?: string;
  source: "submit" | "detail";
  className?: string;
  children?: ReactNode;
}) {
  const [state, setState] = useState<CopyState>("idle");
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  async function copyLink() {
    const copyUrl = resolveUrl(url);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable.");
      }

      await navigator.clipboard.writeText(copyUrl);
      trackEvent("copy_link", { slug, source });
      setState("copied");
    } catch {
      trackEvent("copy_link_failed", { slug, source });
      setState("failed");
    }

    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }
    resetTimerRef.current = window.setTimeout(() => setState("idle"), 1800);
  }

  const Icon = state === "copied" ? Check : Copy;
  const label = state === "copied" ? "Copied" : state === "failed" ? "Copy failed" : children;

  return (
    <button
      type="button"
      onClick={copyLink}
      className={
        className ??
        "inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-black transition hover:border-slate-300"
      }
    >
      <Icon className="size-4" />
      {label}
    </button>
  );
}

function resolveUrl(url: string): string {
  if (typeof window === "undefined") {
    return url;
  }

  try {
    return new URL(url, window.location.origin).toString();
  } catch {
    return url;
  }
}

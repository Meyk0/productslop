import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { SlopArt } from "@/components/slop-art";
import { TypeBadge } from "@/components/type-badge";
import { getSlopTypeMeta, totalReactions, type Slop } from "@/lib/domain/slop";

export function TradingCard({
  slop,
  publicLink = true,
}: {
  slop: Slop;
  publicLink?: boolean;
}) {
  const type = getSlopTypeMeta(slop.type);

  return (
    <article
      className={`rounded-[8px] border-2 p-3 shadow-[0_18px_60px_rgba(31,36,48,0.13)] ${type.cardClass}`}
    >
      <div className="rounded-[7px] border border-black/10 bg-white p-3">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] font-bold uppercase text-muted">
              Product Slop Certified
            </p>
            <h2 className="mt-1 text-2xl font-black leading-tight tracking-normal">
              {slop.title}
            </h2>
          </div>
          <TypeBadge type={slop.type} />
        </div>

        <SlopArt slop={slop} />

        <p className="mt-4 text-lg font-semibold leading-snug text-foreground">
          {slop.tagline}
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 text-sm text-muted">
          <span>{slop.slopperHandle ?? "anonymous slopper"}</span>
          <span className="font-mono font-semibold text-foreground">
            {totalReactions(slop)} reactions
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {publicLink ? (
            <Link
              href={`/p/${slop.slug}`}
              className="inline-flex h-10 items-center justify-center rounded-full bg-foreground px-4 text-sm font-bold text-white transition hover:bg-black"
            >
              Open card
            </Link>
          ) : null}
          <a
            href={slop.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 text-sm font-bold transition hover:border-slate-300"
          >
            View live project
            <ExternalLink className="size-4" />
          </a>
        </div>
      </div>
    </article>
  );
}

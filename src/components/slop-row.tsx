import { Tags, Triangle } from "lucide-react";
import Link from "next/link";
import { SlopArt } from "@/components/slop-art";
import { TypeBadge } from "@/components/type-badge";
import { topReaction, totalReactions, type Slop } from "@/lib/domain/slop";

export function SlopRow({ slop, rank }: { slop: Slop; rank: number }) {
  const reactionTotal = totalReactions(slop);

  return (
    <Link
      href={`/p/${slop.slug}`}
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] gap-3 rounded-[8px] px-0 py-5 transition hover:bg-white sm:gap-4 sm:px-3"
    >
      <SlopArt slop={slop} compact />
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="truncate text-base font-black leading-tight sm:text-lg">
            {rank}. {slop.title}
          </h2>
          {slop.founding ? (
            <span className="hidden rounded-full bg-slop-cream px-2 py-0.5 text-[11px] font-black uppercase text-slop-orange sm:inline-flex">
              Founding Slop
            </span>
          ) : null}
        </div>
        <p className="mt-1 line-clamp-2 text-[15px] leading-6 text-muted sm:text-base">
          {slop.tagline}
        </p>
        <div className="mt-2 hidden flex-wrap items-center gap-x-3 gap-y-2 text-sm text-foreground sm:flex">
          <span className="inline-flex items-center gap-1.5 text-muted">
            <Tags className="size-4" />
            {topReaction(slop)}
          </span>
          <TypeBadge type={slop.type} />
          {slop.slopperHandle ? <span className="text-muted">by {slop.slopperHandle}</span> : null}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Metric icon={<Triangle className="size-4" />} value={reactionTotal} />
      </div>
    </Link>
  );
}

function Metric({ icon, value }: { icon: React.ReactNode; value: number }) {
  return (
    <div className="grid h-14 w-14 place-items-center rounded-[8px] border border-line bg-white font-mono text-sm font-black text-foreground sm:w-16">
      <span className="text-muted">{icon}</span>
      {value}
    </div>
  );
}

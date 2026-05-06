import type { Metadata } from "next";
import Link from "next/link";
import { SlopFeed } from "@/components/slop-feed";
import { TypeBadge } from "@/components/type-badge";
import { rankSlops } from "@/lib/domain/ranking";
import { listSlopOfTheDayWinners, listSlops } from "@/lib/server/slop-service";

export const metadata: Metadata = {
  title: "Hall of Slop",
  description: "Past and current Product Slop winners.",
};

export const dynamic = "force-dynamic";

export default async function HallOfSlopPage() {
  const winners = await listSlopOfTheDayWinners();
  const fallbackSlops = winners.length === 0 ? rankSlops(await listSlops(), "all-time").slice(0, 10) : [];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-black uppercase text-slop-orange">
        Daily winners
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
        Hall of Slop
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        Stored Slop of the Day winners, calculated at midnight UTC from the previous
        day&apos;s reaction totals.
      </p>

      {winners.length > 0 ? (
        <div className="mt-10 space-y-3">
          {winners.map((winner, index) => (
            <Link
              key={winner.date}
              href={`/p/${winner.slop.slug}`}
              className="grid gap-3 rounded-[8px] border border-line bg-white p-4 transition hover:-translate-y-0.5 hover:border-slop-orange hover:shadow-sm sm:grid-cols-[96px_minmax(0,1fr)_auto]"
            >
              <div>
                <p className="font-mono text-xs font-black uppercase text-muted">
                  Day {index + 1}
                </p>
                <p className="mt-1 font-mono text-sm font-black text-slop-orange">
                  {winner.date}
                </p>
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-black">{winner.slop.title}</h2>
                  <TypeBadge type={winner.slop.type} />
                </div>
                <p className="mt-1 text-muted">{winner.slop.tagline}</p>
              </div>
              <div className="self-center rounded-full bg-slop-cream px-4 py-2 font-mono text-sm font-black text-slop-orange">
                {winner.totalReactions}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-10">
          <p className="mb-5 rounded-[8px] border border-line bg-white p-4 text-sm font-semibold text-muted">
            No daily winners have been written yet. Until the first cron run, this
            mirrors the all-time ranking.
          </p>
          <SlopFeed slops={fallbackSlops} />
        </div>
      )}
    </div>
  );
}

import type { Metadata } from "next";
import { SlopFeed } from "@/components/slop-feed";
import { rankSlops } from "@/lib/domain/ranking";
import { listSlops } from "@/lib/server/slop-service";

export const metadata: Metadata = {
  title: "Hall of Slop",
  description: "Past and current Product Slop winners.",
};

export default async function HallOfSlopPage() {
  const winners = rankSlops(await listSlops(), "all-time").slice(0, 10);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <p className="font-mono text-sm font-black uppercase text-slop-orange">
        Winners, eventually
      </p>
      <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
        Hall of Slop
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
        The cron-backed Slop of the Day table will live here. For now this page
        mirrors the all-time ranking so the route and layout are in place.
      </p>
      <div className="mt-10">
        <SlopFeed slops={winners} />
      </div>
    </div>
  );
}

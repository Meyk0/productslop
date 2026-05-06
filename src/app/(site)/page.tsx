import Link from "next/link";
import { HomeWelcome } from "@/app/(site)/welcome";
import { SubmitChallenge } from "@/components/home-sidebars";
import { PeriodTabs } from "@/components/period-tabs";
import { SlopFeed } from "@/components/slop-feed";
import { parseFeedWindow, rankSlops } from "@/lib/domain/ranking";
import { filterSlopsByQuery, normalizeSearchQuery } from "@/lib/domain/search";
import { getLatestSlopOfTheDay, listSlops } from "@/lib/server/slop-service";

type HomeProps = {
  searchParams: Promise<{ deleted?: string; period?: string | string[]; q?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const query = normalizeSearchQuery(params.q);
  const activeWindow = parseFeedWindow(params.period ?? (query ? "all-time" : undefined));
  const [allSlops, slopOfTheDay] = await Promise.all([listSlops(), getLatestSlopOfTheDay()]);
  const slops = filterSlopsByQuery(rankSlops(allSlops, activeWindow), query);
  const heading = query ? "Search launches" : feedHeading(activeWindow);

  return (
    <div className="noise">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            {params.deleted ? (
              <p className="mb-6 rounded-[8px] border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                Slop deleted from the public feed.
              </p>
            ) : null}

            <HomeWelcome />

            {slopOfTheDay ? (
              <Link
                href={`/p/${slopOfTheDay.slop.slug}`}
                className="mt-8 block rounded-[8px] border border-slop-orange/30 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slop-orange hover:shadow-sm"
              >
                <p className="font-mono text-xs font-black uppercase text-slop-orange">
                  Slop of the Day · {slopOfTheDay.date}
                </p>
                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-2xl font-black">{slopOfTheDay.slop.title}</h2>
                    <p className="mt-1 text-muted">{slopOfTheDay.slop.tagline}</p>
                  </div>
                  <span className="rounded-full bg-slop-cream px-4 py-2 font-mono text-sm font-black text-slop-orange">
                    {slopOfTheDay.totalReactions}
                  </span>
                </div>
              </Link>
            ) : null}

            <section className="mt-16">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-sm font-black uppercase text-slop-orange">
                    The launch board for AI slop
                  </p>
                  <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
                    {heading}
                  </h1>
                  {query ? (
                    <p className="mt-3 max-w-2xl text-base text-muted">
                      Showing matches for{" "}
                      <span className="font-bold text-foreground">&quot;{query}&quot;</span>.{" "}
                      <Link href="/" className="font-bold text-slop-orange">
                        Clear search
                      </Link>
                    </p>
                  ) : null}
                </div>
                <PeriodTabs active={activeWindow} query={query} />
              </div>

              <SlopFeed slops={slops} query={query} />
            </section>
          </div>

          <div className="space-y-10">
            <SubmitChallenge />
          </div>
        </div>
      </div>
    </div>
  );
}

function feedHeading(window: ReturnType<typeof parseFeedWindow>): string {
  if (window === "yesterday") {
    return "Top Products From Yesterday";
  }

  if (window === "week") {
    return "Top Products This Week";
  }

  if (window === "all-time") {
    return "Top Products All Time";
  }

  return "Top Products Launching Today";
}

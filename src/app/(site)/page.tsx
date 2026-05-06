import { HomeWelcome } from "@/app/(site)/welcome";
import { SubmitChallenge, TrendingThreads } from "@/components/home-sidebars";
import { PeriodTabs } from "@/components/period-tabs";
import { SlopFeed } from "@/components/slop-feed";
import { parseFeedWindow, rankSlops } from "@/lib/domain/ranking";
import { listSlops } from "@/lib/server/slop-service";

type HomeProps = {
  searchParams: Promise<{ deleted?: string; period?: string | string[] }>;
};

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const activeWindow = parseFeedWindow(params.period);
  const slops = rankSlops(await listSlops(), activeWindow);

  return (
    <div className="noise">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            {params.deleted ? (
              <p className="mb-6 rounded-[8px] border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
                Slop deleted from the public feed.
              </p>
            ) : null}

            <HomeWelcome />

            <section className="mt-16">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-sm font-black uppercase text-slop-orange">
                    The front page of AI slop
                  </p>
                  <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
                    Top Products Launching Today
                  </h1>
                </div>
                <PeriodTabs active={activeWindow} />
              </div>

              <SlopFeed slops={slops} />
            </section>
          </div>

          <div className="space-y-10">
            <SubmitChallenge />
            <TrendingThreads />
          </div>
        </div>
      </div>
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReactionMenu } from "@/components/reaction-menu";
import { SlopFeed } from "@/components/slop-feed";
import { TradingCard } from "@/components/trading-card";
import { rankSlops } from "@/lib/domain/ranking";
import { getSlopBySlug, listSlops } from "@/lib/server/slop-service";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const slop = await getSlopBySlug(slug);

  if (!slop) {
    return { title: "Slop not found" };
  }

  return {
    title: slop.title,
    description: slop.tagline,
    openGraph: {
      title: slop.title,
      description: slop.tagline,
      images: [`/api/og/${slop.slug}`],
    },
    twitter: {
      card: "summary_large_image",
      title: slop.title,
      description: slop.tagline,
      images: [`/api/og/${slop.slug}`],
    },
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const slop = await getSlopBySlug(slug);

  if (!slop) {
    notFound();
  }

  const moreSlop = rankSlops(await listSlops(), "all-time")
    .filter((candidate) => candidate.id !== slop.id)
    .slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(340px,460px)_minmax(0,1fr)]">
        <TradingCard slop={slop} publicLink={false} />
        <div className="space-y-6">
          <div>
            <p className="font-mono text-sm font-black uppercase text-slop-orange">
              Public launch card
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
              {slop.title}
            </h1>
            <p className="mt-4 max-w-2xl text-xl leading-8 text-muted">{slop.tagline}</p>
          </div>

          <ReactionMenu slop={slop} />

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-2xl font-black">More slop</h2>
              <a
                href="/submit"
                className="rounded-full bg-slop-orange px-4 py-2 text-sm font-black text-white"
              >
                Submit your own
              </a>
            </div>
            <SlopFeed slops={moreSlop} />
          </section>
        </div>
      </div>
    </div>
  );
}

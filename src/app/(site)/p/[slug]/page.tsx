import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminDeleteSlopAction } from "@/app/(site)/p/[slug]/actions";
import { CopyLinkButton } from "@/components/copy-link-button";
import { ReactionMenu } from "@/components/reaction-menu";
import { SlopFeed } from "@/components/slop-feed";
import { TradingCard } from "@/components/trading-card";
import { rankSlops } from "@/lib/domain/ranking";
import { canAdminDelete, normalizeAdminToken } from "@/lib/server/admin";
import { getSlopBySlug, listSlops } from "@/lib/server/slop-service";

type ProjectPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ admin?: string | string[]; adminError?: string }>;
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

export default async function ProjectPage({ params, searchParams }: ProjectPageProps) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const adminToken = normalizeAdminToken(query.admin);
  const isAdmin = canAdminDelete(adminToken);
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
            <div className="mt-5 flex flex-wrap gap-2">
              <CopyLinkButton url={`/p/${slop.slug}`} slug={slop.slug} source="detail" />
              <a
                href={slop.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-4 text-sm font-black text-white transition hover:bg-black"
              >
                Visit project
              </a>
            </div>
          </div>

          <ReactionMenu
            slop={{
              slug: slop.slug,
              reactionCounts: slop.reactionCounts,
            }}
            turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
          />

          {query.adminError ? (
            <p className="rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {query.adminError}
            </p>
          ) : null}

          {isAdmin && adminToken ? <AdminDeletePanel slug={slop.slug} token={adminToken} /> : null}

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

function AdminDeletePanel({ slug, token }: { slug: string; token: string }) {
  const action = adminDeleteSlopAction.bind(null, slug, token);

  return (
    <section className="rounded-[8px] border border-rose-200 bg-rose-50 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-mono text-xs font-black uppercase text-rose-700">Admin</p>
          <h2 className="mt-1 text-lg font-black text-rose-950">Delete this launch</h2>
          <p className="text-sm leading-6 text-rose-800">
            Soft-deletes it from public feeds and detail pages.
          </p>
        </div>
        <form action={action}>
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center rounded-full bg-rose-600 px-5 font-black text-white transition hover:bg-rose-700"
          >
            Delete
          </button>
        </form>
      </div>
    </section>
  );
}

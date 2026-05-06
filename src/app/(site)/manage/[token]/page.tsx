import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink, Trash2 } from "lucide-react";
import { TradingCard } from "@/components/trading-card";
import { getSlopByManageToken } from "@/lib/server/slop-service";
import { deleteSlopAction, updateTaglineAction } from "@/app/(site)/manage/[token]/actions";

export const metadata: Metadata = {
  title: "Manage Slop",
  description: "Magic-link management for a submitted slop.",
};

type ManagePageProps = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
};

export default async function ManagePage({ params, searchParams }: ManagePageProps) {
  const { token } = await params;
  const query = await searchParams;
  const slop = await getSlopByManageToken(token);
  const updateAction = updateTaglineAction.bind(null, token);
  const removeAction = deleteSlopAction.bind(null, token);

  if (!slop) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <p className="font-mono text-sm font-black uppercase text-slop-orange">
          Magic link
        </p>
        <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
          This link does not manage live slop.
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          It may be expired, mistyped, or already deleted.
        </p>
        <Link
          href="/submit"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-slop-orange px-5 font-black text-white"
        >
          Submit fresh slop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <TradingCard slop={slop} />

        <div>
          <p className="font-mono text-sm font-black uppercase text-slop-orange">
            Magic link
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-normal sm:text-5xl">
            Manage {slop.title}
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-muted">
            Update the AI tagline or remove the launch. No account required.
          </p>

          {query.updated ? (
            <p className="mt-6 rounded-[8px] border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
              Tagline updated.
            </p>
          ) : null}
          {query.error ? (
            <p className="mt-6 rounded-[8px] border border-rose-200 bg-rose-50 p-3 text-sm font-bold text-rose-700">
              {query.error}
            </p>
          ) : null}

          <section className="mt-8 rounded-[8px] border border-line bg-white p-5">
            <h2 className="text-xl font-black">Edit tagline</h2>
            <form action={updateAction} className="mt-4">
              <label className="block">
                <span className="text-sm font-black uppercase text-muted">
                  Tagline
                </span>
                <textarea
                  name="tagline"
                  defaultValue={slop.tagline}
                  maxLength={100}
                  required
                  rows={3}
                  className="mt-2 w-full resize-none rounded-[8px] border border-line px-4 py-3 text-lg font-semibold outline-none transition focus:border-slop-orange focus:ring-4 focus:ring-orange-100"
                />
              </label>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-slop-orange px-5 font-black text-white transition hover:bg-slop-orange-strong"
                >
                  Save tagline
                </button>
                <Link
                  href={`/p/${slop.slug}`}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-line bg-white px-5 font-black transition hover:border-slate-300"
                >
                  View public page
                  <ExternalLink className="size-4" />
                </Link>
              </div>
            </form>
          </section>

          <section className="mt-5 rounded-[8px] border border-rose-200 bg-rose-50 p-5">
            <h2 className="text-xl font-black text-rose-950">Delete launch</h2>
            <p className="mt-2 text-sm leading-6 text-rose-800">
              This soft-deletes the slop from public feeds and detail pages.
            </p>
            <form action={removeAction} className="mt-4">
              <button
                type="submit"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-rose-600 px-5 font-black text-white transition hover:bg-rose-700"
              >
                <Trash2 className="size-4" />
                Delete slop
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}

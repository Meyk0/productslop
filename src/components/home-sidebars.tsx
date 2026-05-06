import { MessageCircle, Triangle } from "lucide-react";
import Link from "next/link";

export function SubmitChallenge() {
  return (
    <aside className="rounded-[8px] border border-orange-100 bg-[#f8ead8] p-5">
      <div className="flex items-center gap-4">
        <div className="grid size-14 place-items-center rounded-[8px] bg-slop-orange text-3xl font-black text-white">
          S
        </div>
        <div>
          <h2 className="text-xl font-black">Slop Application Day</h2>
          <p className="text-muted">By the weekend build committee</p>
        </div>
      </div>

      <div className="mt-6 space-y-4 text-base">
        <p className="rounded-[8px] border border-line bg-white p-4 font-semibold leading-7">
          Launch to win absolutely nothing except a suspicious amount of validation.
        </p>
        <p className="rounded-[8px] border border-line bg-white p-4 text-muted">
          Submissions reset at{" "}
          <span className="font-mono font-black text-foreground">00:00 UTC</span>.
        </p>
      </div>

      <Link
        href="/submit"
        className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full bg-slop-orange px-5 font-black text-white transition hover:bg-slop-orange-strong"
      >
        Launch now
      </Link>
    </aside>
  );
}

export function TrendingThreads() {
  return (
    <aside className="pt-4">
      <h2 className="text-xl font-black">Trending Forum Threads</h2>
      <div className="mt-8 space-y-8">
        <Thread
          channel="p/productslop"
          title="Missed the YC deadline? Ship slop anyway"
          stats="Upvote (192) / 19 replies / 21 online"
        />
        <Thread
          channel="p/general"
          title="How do you decide what features the model definitely invented?"
          stats="Upvote (88) / 11 replies / 9 online"
        />
      </div>
    </aside>
  );
}

function Thread({
  channel,
  title,
  stats,
}: {
  channel: string;
  title: string;
  stats: string;
}) {
  return (
    <div>
      <p className="font-bold text-muted">{channel}</p>
      <h3 className="mt-2 text-lg font-black leading-snug">{title}</h3>
      <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
        <Triangle className="size-4" />
        {stats}
        <MessageCircle className="size-4" />
      </p>
    </div>
  );
}

import Link from "next/link";
import type { FeedWindow } from "@/lib/domain/ranking";

const tabs: Array<{ id: FeedWindow; label: string }> = [
  { id: "today", label: "Today" },
  { id: "yesterday", label: "Yesterday" },
  { id: "week", label: "Week" },
  { id: "all-time", label: "All-time" },
];

export function PeriodTabs({ active, query }: { active: FeedWindow; query?: string }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Feed period">
      {tabs.map((tab) => (
        <Link
          key={tab.id}
          href={periodHref(tab.id, query)}
          className={`rounded-full border px-4 py-2 text-sm font-bold transition ${
            active === tab.id
              ? "border-slop-orange bg-slop-orange text-white"
              : "border-line bg-white text-foreground hover:border-slate-300"
          }`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function periodHref(period: FeedWindow, query?: string): string {
  const params = new URLSearchParams();

  if (period !== "today") {
    params.set("period", period);
  }

  if (query) {
    params.set("q", query);
  }

  const search = params.toString();
  return search ? `/?${search}` : "/";
}

import { SlopRow } from "@/components/slop-row";
import type { Slop } from "@/lib/domain/slop";

export function SlopFeed({ slops, query }: { slops: Slop[]; query?: string }) {
  if (slops.length === 0) {
    return (
      <div className="rounded-[8px] border border-dashed border-line bg-white p-8 text-center">
        <h2 className="text-xl font-black">
          {query ? "No matching launches" : "No slop in this window yet"}
        </h2>
        <p className="mt-2 text-muted">
          {query
            ? "Try a product name, maker handle, category, or domain."
            : "A fresh leaderboard is waiting to be ruined."}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-line">
      {slops.map((slop, index) => (
        <SlopRow key={slop.id} slop={slop} rank={index + 1} />
      ))}
    </div>
  );
}

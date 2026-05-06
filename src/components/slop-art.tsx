import { getSlopTypeMeta, type Slop } from "@/lib/domain/slop";

export function SlopArt({
  slop,
  compact = false,
}: {
  slop: Pick<Slop, "title" | "type">;
  compact?: boolean;
}) {
  const meta = getSlopTypeMeta(slop.type);
  const initials = slop.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[8px] bg-linear-to-br ${meta.artClass} ${
        compact ? "size-16" : "aspect-[16/10] w-full"
      }`}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.85),transparent_32%),radial-gradient(circle_at_76%_74%,rgba(255,255,255,0.28),transparent_22%)]" />
      <div className="relative rounded-[6px] border border-white/55 bg-black/70 px-3 py-2 font-mono text-xl font-black tracking-normal text-white shadow-lg">
        {initials || "PS"}
      </div>
    </div>
  );
}

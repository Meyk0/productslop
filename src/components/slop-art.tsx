import type { CSSProperties } from "react";
import { getSlopTypeMeta, type Slop } from "@/lib/domain/slop";

export function SlopArt({
  slop,
  compact = false,
}: {
  slop: Pick<Slop, "title" | "type" | "screenshotUrl">;
  compact?: boolean;
}) {
  const meta = getSlopTypeMeta(slop.type);
  const screenshotStyle: CSSProperties | undefined = slop.screenshotUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(31, 36, 48, 0.04), rgba(31, 36, 48, 0.38)), url("${slop.screenshotUrl}")`,
      }
    : undefined;
  const initials = slop.title
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return (
    <div
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-[8px] ${
        slop.screenshotUrl ? "bg-cover bg-center" : `bg-linear-to-br ${meta.artClass}`
      } ${
        compact ? "size-16" : "aspect-[16/10] w-full"
      }`}
      style={screenshotStyle}
      aria-hidden="true"
    >
      {slop.screenshotUrl ? null : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.85),transparent_32%),radial-gradient(circle_at_76%_74%,rgba(255,255,255,0.28),transparent_22%)]" />
      )}
      <div
        className={`relative rounded-[6px] border border-white/55 bg-black/70 px-3 py-2 font-mono font-black tracking-normal text-white shadow-lg ${
          compact ? "text-sm" : "text-xl"
        }`}
      >
        {initials || "PS"}
      </div>
    </div>
  );
}

import { getSlopTypeMeta, type SlopType } from "@/lib/domain/slop";

export function TypeBadge({ type }: { type: SlopType }) {
  const meta = getSlopTypeMeta(type);

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.badgeClass}`}
    >
      {meta.label}
    </span>
  );
}

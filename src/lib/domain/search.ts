import type { Slop } from "@/lib/domain/slop";

const maxQueryLength = 80;

export function normalizeSearchQuery(value?: string | string[]): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  return (candidate ?? "").trim().replace(/\s+/g, " ").slice(0, maxQueryLength);
}

export function filterSlopsByQuery(slops: Slop[], query: string): Slop[] {
  const tokens = normalizeSearchQuery(query).toLowerCase().split(" ").filter(Boolean);

  if (tokens.length === 0) {
    return slops;
  }

  return slops.filter((slop) => {
    const searchableText = [
      slop.title,
      slop.tagline,
      slop.type,
      slop.slopperHandle,
      slop.url,
      slop.slug,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return tokens.every((token) => searchableText.includes(token));
  });
}

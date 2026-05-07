import { describe, expect, it } from "vitest";
import { rankSlops } from "@/lib/domain/ranking";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";

function slop(overrides: Partial<Slop>): Slop {
  return {
    id: "id",
    slug: "slug",
    url: "https://example.com",
    title: "Example",
    tagline: "A test slop",
    type: "demo",
    reslopUsed: false,
    founding: false,
    createdAt: "2026-05-06T01:00:00.000Z",
    reactionCounts: createEmptyReactionCounts(),
    ...overrides,
  };
}

describe("feed ranking", () => {
  it("uses UTC day boundaries for today", () => {
    const now = new Date("2026-05-06T12:00:00.000Z");
    const today = slop({
      id: "today",
      slug: "today",
      createdAt: "2026-05-06T00:00:00.000Z",
    });
    const yesterday = slop({
      id: "yesterday",
      slug: "yesterday",
      createdAt: "2026-05-05T23:59:59.999Z",
    });

    expect(rankSlops([today, yesterday], "today", now).map((item) => item.id)).toEqual([
      "today",
    ]);
  });

  it("sorts by total reactions, then newest", () => {
    const newer = slop({
      id: "newer",
      slug: "newer",
      createdAt: "2026-05-06T04:00:00.000Z",
      reactionCounts: { ...createEmptyReactionCounts(), "peak-slop": 2 },
    });
    const olderWinner = slop({
      id: "olderWinner",
      slug: "older-winner",
      createdAt: "2026-05-06T03:00:00.000Z",
      reactionCounts: { ...createEmptyReactionCounts(), "peak-slop": 7 },
    });

    expect(
      rankSlops([newer, olderWinner], "today", new Date("2026-05-06T12:00:00.000Z")).map(
        (item) => item.id,
      ),
    ).toEqual(["olderWinner", "newer"]);
  });
});

import { describe, expect, it } from "vitest";
import {
  previousUtcDateKey,
  selectSlopOfTheDay,
  toUtcDateKey,
} from "@/lib/domain/slop-of-the-day";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";

describe("Slop of the Day", () => {
  it("uses the previous UTC day key", () => {
    expect(previousUtcDateKey(new Date("2026-05-06T00:03:00.000Z"))).toBe(
      "2026-05-05",
    );
    expect(toUtcDateKey(new Date("2026-05-06T23:59:00.000Z"))).toBe("2026-05-06");
  });

  it("selects the highest reaction slop for a UTC date", () => {
    const winner = slop({
      id: "winner",
      slug: "winner",
      createdAt: "2026-05-05T12:00:00.000Z",
      reactionCounts: { ...createEmptyReactionCounts(), delve: 7 },
    });
    const runnerUp = slop({
      id: "runner-up",
      slug: "runner-up",
      createdAt: "2026-05-05T20:00:00.000Z",
      reactionCounts: { ...createEmptyReactionCounts(), delve: 3 },
    });
    const otherDay = slop({
      id: "other-day",
      slug: "other-day",
      createdAt: "2026-05-06T00:00:00.000Z",
      reactionCounts: { ...createEmptyReactionCounts(), delve: 99 },
    });

    expect(selectSlopOfTheDay([runnerUp, otherDay, winner], "2026-05-05")).toMatchObject({
      date: "2026-05-05",
      slop: { id: "winner" },
      totalReactions: 7,
    });
  });

  it("breaks ties by newest launch", () => {
    const older = slop({
      id: "older",
      slug: "older",
      createdAt: "2026-05-05T10:00:00.000Z",
      reactionCounts: { ...createEmptyReactionCounts(), delve: 2 },
    });
    const newer = slop({
      id: "newer",
      slug: "newer",
      createdAt: "2026-05-05T11:00:00.000Z",
      reactionCounts: { ...createEmptyReactionCounts(), delve: 2 },
    });

    expect(selectSlopOfTheDay([older, newer], "2026-05-05")?.slop.id).toBe("newer");
  });
});

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
    createdAt: "2026-05-05T01:00:00.000Z",
    reactionCounts: createEmptyReactionCounts(),
    ...overrides,
  };
}

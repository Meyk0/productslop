import { describe, expect, it } from "vitest";
import { applyReaction } from "@/lib/domain/reactions";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";

function testSlop(): Slop {
  return {
    id: "slop-1",
    slug: "slop-1",
    url: "https://example.com",
    title: "Test Slop",
    tagline: "Looks tested to me",
    type: "demo",
    reslopUsed: false,
    founding: false,
    createdAt: new Date().toISOString(),
    reactionCounts: createEmptyReactionCounts(),
  };
}

describe("reaction application", () => {
  it("increments one reaction per session", () => {
    const slop = testSlop();
    const ledger = new Set<string>();

    expect(applyReaction(slop, "peak-slop", "session-1", ledger)).toMatchObject({
      ok: true,
      changed: true,
    });
    expect(applyReaction(slop, "peak-slop", "session-1", ledger)).toMatchObject({
      ok: true,
      changed: false,
    });
    expect(slop.reactionCounts["peak-slop"]).toBe(1);
  });

  it("rejects unknown reactions", () => {
    expect(applyReaction(testSlop(), "like", "session-1", new Set())).toEqual({
      ok: false,
      message: "Unknown reaction.",
    });
  });
});

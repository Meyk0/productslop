import { describe, expect, it } from "vitest";
import { filterSlopsByQuery, normalizeSearchQuery } from "@/lib/domain/search";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";

function slop(overrides: Partial<Slop>): Slop {
  return {
    id: "id",
    slug: "slug",
    url: "https://example.com",
    title: "Example",
    tagline: "A test slop",
    type: "demo",
    slopperHandle: "@maker",
    reslopUsed: false,
    founding: false,
    createdAt: "2026-05-06T01:00:00.000Z",
    reactionCounts: createEmptyReactionCounts(),
    ...overrides,
  };
}

describe("slop search", () => {
  it("normalizes query whitespace and array input", () => {
    expect(normalizeSearchQuery(["  Eval   Arena  ", "ignored"])).toBe("Eval Arena");
  });

  it("returns all slops for a blank query", () => {
    const slops = [slop({ id: "one" }), slop({ id: "two" })];

    expect(filterSlopsByQuery(slops, " ")).toEqual(slops);
  });

  it("matches title, tagline, handle, and url case-insensitively", () => {
    const evalArena = slop({
      id: "evalarena",
      slug: "evalarena-llm-evals",
      url: "https://evalarena.xyz",
      title: "EvalArena",
      tagline: "Practice LLM evals with hidden tests",
      slopperHandle: "@meyk0",
    });
    const standup = slop({
      id: "standup",
      title: "Standup Arcade",
      tagline: "A retro standup order picker",
    });

    expect(filterSlopsByQuery([evalArena, standup], "MEYK0 hidden")).toEqual([evalArena]);
    expect(filterSlopsByQuery([evalArena, standup], "standuP")).toEqual([standup]);
  });
});

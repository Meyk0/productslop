import { describe, expect, it } from "vitest";
import {
  createEmptyReactionCounts,
  createSlug,
  isReactionType,
  totalReactions,
} from "@/lib/domain/slop";

describe("slop domain helpers", () => {
  it("creates reaction count records for every locked reaction", () => {
    const counts = createEmptyReactionCounts();

    expect(Object.keys(counts)).toHaveLength(7);
    expect(counts["peak-slop"]).toBe(0);
    expect(counts.delve).toBe(0);
  });

  it("sums reaction counts", () => {
    const counts = createEmptyReactionCounts();
    counts["peak-slop"] = 3;
    counts["one-shotted"] = 4;

    expect(totalReactions({ reactionCounts: counts })).toBe(7);
  });

  it("guards reaction ids", () => {
    expect(isReactionType("peak-slop")).toBe(true);
    expect(isReactionType("upvote")).toBe(false);
  });

  it("creates stable readable slugs", () => {
    expect(createSlug("DeckSpell: Founder Decks!!!", "AbC-123-xyz")).toBe(
      "deckspell-founder-decks-abc123",
    );
  });
});

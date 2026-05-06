import { describe, expect, it } from "vitest";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";
import { countReactions, toSlop, toSlopInsert, type SlopRow } from "@/lib/server/supabase-mappers";

const row: SlopRow = {
  id: "4b5bd533-3071-42c6-a864-8e62f2df0665",
  slug: "test-slop",
  url: "https://example.com",
  title: "Test Slop",
  tagline: "A tested thing",
  screenshot_url: "https://example.com/screenshot.png",
  type: "tool",
  slopper_handle: "@tester",
  email: "test@example.com",
  manage_token: "token",
  reslop_used: false,
  created_at: "2026-05-06T00:00:00.000Z",
  deleted_at: null,
};

describe("Supabase mappers", () => {
  it("maps slop rows into domain slops with counted reactions", () => {
    expect(
      toSlop(row, [
        { slop_id: row.id, reaction_type: "peak-slop" },
        { slop_id: row.id, reaction_type: "peak-slop" },
        { slop_id: row.id, reaction_type: "not-real" },
      ]),
    ).toMatchObject({
      id: row.id,
      slug: "test-slop",
      title: "Test Slop",
      type: "tool",
      reactionCounts: {
        ...createEmptyReactionCounts(),
        "peak-slop": 2,
      },
    });
  });

  it("ignores reactions for other slops", () => {
    expect(
      countReactions(row.id, [
        { slop_id: "other", reaction_type: "peak-slop" },
        { slop_id: row.id, reaction_type: "delve" },
      ]),
    ).toMatchObject({ delve: 1, "peak-slop": 0 });
  });

  it("maps domain slops into insert rows", () => {
    const slop: Slop = {
      id: row.id,
      slug: row.slug,
      url: row.url,
      title: row.title ?? "Test Slop",
      tagline: row.tagline ?? "A tested thing",
      screenshotUrl: row.screenshot_url ?? undefined,
      type: "tool",
      slopperHandle: "@tester",
      email: "test@example.com",
      manageToken: "token",
      reslopUsed: false,
      founding: false,
      createdAt: row.created_at ?? new Date().toISOString(),
      reactionCounts: createEmptyReactionCounts(),
    };

    expect(toSlopInsert(slop)).toEqual({
      id: row.id,
      slug: "test-slop",
      url: "https://example.com",
      title: "Test Slop",
      tagline: "A tested thing",
      screenshot_url: "https://example.com/screenshot.png",
      type: "tool",
      slopper_handle: "@tester",
      email: "test@example.com",
      manage_token: "token",
      reslop_used: false,
      created_at: "2026-05-06T00:00:00.000Z",
    });
  });
});

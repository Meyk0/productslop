import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";
import { listSlopsFromSupabase } from "@/lib/server/supabase-store";

vi.mock("server-only", () => ({}));

describe("Supabase store", () => {
  it("paginates reaction rows when listing slops", async () => {
    const slopRow = {
      id: "slop-id",
      slug: "many-reactions",
      url: "https://example.com/many-reactions",
      title: "Many Reactions",
      tagline: "Enough reactions to cross the default Supabase page limit",
      type: "tool",
      slopper_handle: "@many",
      reslop_used: false,
      created_at: "2026-05-06T10:00:00.000Z",
      deleted_at: null,
    };
    const reactionRows = Array.from({ length: 1_005 }, () => ({
      slop_id: slopRow.id,
      reaction_type: "peak-slop",
    }));
    const reactionRanges: Array<[number, number]> = [];
    const client = createSupabaseClientStub({
      slopRows: [slopRow],
      reactionRows,
      reactionRanges,
    });

    await expect(listSlopsFromSupabase(client)).resolves.toMatchObject([
      {
        id: slopRow.id,
        slug: slopRow.slug,
        reactionCounts: {
          "peak-slop": 1_005,
        },
      },
    ]);
    expect(reactionRanges).toEqual([
      [0, 999],
      [1000, 1999],
    ]);
  });
});

function createSupabaseClientStub(params: {
  slopRows: unknown[];
  reactionRows: unknown[];
  reactionRanges: Array<[number, number]>;
}): SupabaseClient {
  return {
    from(table: string) {
      if (table === "slop") {
        return {
          select() {
            return {
              is() {
                return {
                  order: vi.fn().mockResolvedValue({
                    data: params.slopRows,
                    error: null,
                  }),
                };
              },
            };
          },
        };
      }

      if (table === "reaction") {
        return {
          select() {
            return {
              in() {
                return {
                  range: vi.fn().mockImplementation((from: number, to: number) => {
                    params.reactionRanges.push([from, to]);

                    return Promise.resolve({
                      data: params.reactionRows.slice(from, to + 1),
                      error: null,
                    });
                  }),
                };
              },
            };
          },
        };
      }

      throw new Error(`Unexpected table: ${table}`);
    },
  } as unknown as SupabaseClient;
}

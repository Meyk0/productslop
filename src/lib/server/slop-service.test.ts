import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";
import { getSupabaseAdminClient } from "@/lib/server/clients";
import {
  getSlopBySlugFromSupabase,
  listSlopOfTheDayFromSupabase,
  listSlopsFromSupabase,
} from "@/lib/server/supabase-store";
import {
  getLocalSlopBySlug,
  listLocalSlopOfTheDay,
  listLocalSlops,
} from "@/lib/server/local-store";
import { getLatestSlopOfTheDay, getSlopBySlug, listSlops } from "@/lib/server/slop-service";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/server/clients", () => ({
  getSupabaseAdminClient: vi.fn(),
}));

vi.mock("@/lib/server/supabase-store", () => ({
  getSlopByManageTokenFromSupabase: vi.fn(),
  getSlopBySlugFromSupabase: vi.fn(),
  insertReactionIntoSupabase: vi.fn(),
  insertSlopIntoSupabase: vi.fn(),
  listSlopOfTheDayFromSupabase: vi.fn(),
  listSlopsFromSupabase: vi.fn(),
  reslopSlopInSupabase: vi.fn(),
  softDeleteSlopBySlugInSupabase: vi.fn(),
  softDeleteSlopInSupabase: vi.fn(),
  updateSlopTaglineInSupabase: vi.fn(),
  upsertSlopOfTheDayInSupabase: vi.fn(),
}));

vi.mock("@/lib/server/local-store", () => ({
  getLocalSlopByManageToken: vi.fn(),
  getLocalSlopBySlug: vi.fn(),
  insertLocalReaction: vi.fn(),
  insertLocalSlop: vi.fn(),
  listLocalSlopOfTheDay: vi.fn(),
  listLocalSlops: vi.fn(),
  reslopLocalSlop: vi.fn(),
  softDeleteLocalSlopBySlug: vi.fn(),
  softDeleteLocalSlop: vi.fn(),
  updateLocalSlopTagline: vi.fn(),
  upsertLocalSlopOfTheDay: vi.fn(),
}));

const getSupabaseAdminClientMock = vi.mocked(getSupabaseAdminClient);
const listSlopsFromSupabaseMock = vi.mocked(listSlopsFromSupabase);
const getSlopBySlugFromSupabaseMock = vi.mocked(getSlopBySlugFromSupabase);
const listSlopOfTheDayFromSupabaseMock = vi.mocked(listSlopOfTheDayFromSupabase);
const listLocalSlopsMock = vi.mocked(listLocalSlops);
const getLocalSlopBySlugMock = vi.mocked(getLocalSlopBySlug);
const listLocalSlopOfTheDayMock = vi.mocked(listLocalSlopOfTheDay);

beforeEach(() => {
  vi.resetAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("slop service read fallbacks", () => {
  it("uses local slops when configured Supabase reads fail", async () => {
    const slops = [makeSlop()];
    getSupabaseAdminClientMock.mockReturnValue({} as never);
    listSlopsFromSupabaseMock.mockRejectedValue(new Error("Invalid API key"));
    listLocalSlopsMock.mockResolvedValue(slops);

    await expect(listSlops()).resolves.toEqual(slops);
    expect(listLocalSlopsMock).toHaveBeenCalled();
  });

  it("uses local slug lookup when configured Supabase reads fail", async () => {
    const slop = makeSlop();
    getSupabaseAdminClientMock.mockReturnValue({} as never);
    getSlopBySlugFromSupabaseMock.mockRejectedValue(new Error("Invalid API key"));
    getLocalSlopBySlugMock.mockResolvedValue(slop);

    await expect(getSlopBySlug("local-slop")).resolves.toBe(slop);
    expect(getLocalSlopBySlugMock).toHaveBeenCalledWith("local-slop");
  });

  it("uses local winners when configured Supabase reads fail", async () => {
    const winner = {
      date: "2026-05-06",
      slop: makeSlop(),
      totalReactions: 3,
    };
    getSupabaseAdminClientMock.mockReturnValue({} as never);
    listSlopOfTheDayFromSupabaseMock.mockRejectedValue(new Error("Invalid API key"));
    listLocalSlopOfTheDayMock.mockResolvedValue([winner]);

    await expect(getLatestSlopOfTheDay()).resolves.toBe(winner);
    expect(listLocalSlopOfTheDayMock).toHaveBeenCalled();
  });
});

function makeSlop(): Slop {
  return {
    id: "local-slop",
    slug: "local-slop",
    url: "https://example.com/local-slop",
    title: "Local Slop",
    tagline: "Local fallback",
    type: "demo",
    email: "maker@example.com",
    manageToken: "manage-token",
    reslopUsed: false,
    founding: true,
    createdAt: "2026-05-06T10:00:00.000Z",
    reactionCounts: createEmptyReactionCounts(),
  };
}

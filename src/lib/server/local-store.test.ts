import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";

vi.mock("server-only", () => ({}));

const originalCwd = process.cwd();

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(os.tmpdir(), "productslop-store-"));
  process.chdir(tempDir);
  vi.resetModules();
});

afterEach(async () => {
  process.chdir(originalCwd);
  await rm(tempDir, { recursive: true, force: true });
  vi.resetModules();
});

describe("local store", () => {
  it("persists slops across create, manage lookup, edit, and soft delete", async () => {
    const store = await import("@/lib/server/local-store");
    const slop = makeSlop();

    await store.insertLocalSlop(slop);

    expect(await store.getLocalSlopBySlug(slop.slug)).toMatchObject({
      id: slop.id,
      title: "Local Slop",
    });
    expect(await store.getLocalSlopByManageToken("manage-token")).toMatchObject({
      id: slop.id,
    });

    await expect(store.updateLocalSlopTagline("missing", "Nope")).resolves.toBeUndefined();
    await expect(
      store.updateLocalSlopTagline("manage-token", "A sharper local tagline"),
    ).resolves.toMatchObject({
      id: slop.id,
      tagline: "A sharper local tagline",
    });
    await expect(
      store.reslopLocalSlop("manage-token", "A one-shot reslop tagline"),
    ).resolves.toMatchObject({
      id: slop.id,
      tagline: "A one-shot reslop tagline",
      reslopUsed: true,
    });
    await expect(
      store.reslopLocalSlop("manage-token", "A second reslop should fail"),
    ).resolves.toBeUndefined();

    await expect(store.softDeleteLocalSlop("manage-token")).resolves.toBe(true);
    await expect(store.getLocalSlopBySlug(slop.slug)).resolves.toBeUndefined();
    await expect(store.getLocalSlopByManageToken("manage-token")).resolves.toBeUndefined();
  });

  it("deduplicates and persists local reactions", async () => {
    const store = await import("@/lib/server/local-store");
    const slop = makeSlop();

    await store.insertLocalSlop(slop);

    await expect(
      store.insertLocalReaction({
        slopId: slop.id,
        reactionType: "delve",
        sessionId: "session-1",
      }),
    ).resolves.toEqual({
      changed: true,
      counts: { ...createEmptyReactionCounts(), delve: 1 },
    });

    await expect(
      store.insertLocalReaction({
        slopId: slop.id,
        reactionType: "delve",
        sessionId: "session-1",
      }),
    ).resolves.toEqual({
      changed: false,
      counts: { ...createEmptyReactionCounts(), delve: 1 },
    });

    vi.resetModules();
    const freshStore = await import("@/lib/server/local-store");

    await expect(freshStore.getLocalSlopBySlug(slop.slug)).resolves.toMatchObject({
      reactionCounts: { ...createEmptyReactionCounts(), delve: 1 },
    });
  });

  it("upserts and lists local Slop of the Day winners", async () => {
    const store = await import("@/lib/server/local-store");
    const slop = makeSlop();

    await store.insertLocalSlop(slop);
    await store.upsertLocalSlopOfTheDay({
      date: "2026-05-06",
      slop,
      totalReactions: 4,
    });
    await store.upsertLocalSlopOfTheDay({
      date: "2026-05-06",
      slop,
      totalReactions: 5,
    });

    await expect(store.listLocalSlopOfTheDay()).resolves.toEqual([
      {
        date: "2026-05-06",
        slop,
        totalReactions: 5,
      },
    ]);
  });

  it("merges new bundled seed slops into an existing fallback store", async () => {
    await mkdir(path.join(tempDir, ".data"));
    await writeFile(
      path.join(tempDir, ".data", "local-store.json"),
      JSON.stringify({
        slops: [makeSlop()],
        reactionLedger: [],
        slopOfTheDay: [],
      }),
    );

    const store = await import("@/lib/server/local-store");

    await expect(store.listLocalSlops()).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ slug: "local-slop", title: "Local Slop" }),
        expect.objectContaining({
          slug: "standup-arcade-order-picker",
          title: "Standup Arcade",
        }),
      ]),
    );

    const persisted = JSON.parse(
      await readFile(path.join(tempDir, ".data", "local-store.json"), "utf8"),
    ) as { slops: Array<{ slug: string }> };
    expect(persisted.slops.some((slop) => slop.slug === "standup-arcade-order-picker")).toBe(
      true,
    );
  });

  it("returns seeded slops when the fallback store cannot be persisted", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    await chmod(tempDir, 0o500);

    try {
      const store = await import("@/lib/server/local-store");

      const slops = await store.listLocalSlops();

      expect(slops.length).toBeGreaterThan(0);
      expect(slops).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            slug: "kanwas-open-source-brain",
            title: "Kanwas",
          }),
        ]),
      );
      expect(warn).toHaveBeenCalledWith(
        "Unable to persist initial local Product Slop store",
        expect.anything(),
      );
    } finally {
      await chmod(tempDir, 0o700);
      warn.mockRestore();
    }
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

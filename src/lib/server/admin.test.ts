import { afterEach, describe, expect, it, vi } from "vitest";
import { canAdminDelete, isAdminDeleteEnabled, normalizeAdminToken } from "@/lib/server/admin";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("admin feature gates", () => {
  it("keeps delete disabled without a long token", () => {
    vi.stubEnv("ADMIN_DELETE_TOKEN", "short");

    expect(isAdminDeleteEnabled()).toBe(false);
    expect(canAdminDelete("short")).toBe(false);
  });

  it("accepts the configured admin delete token", () => {
    vi.stubEnv("ADMIN_DELETE_TOKEN", "0123456789abcdef");

    expect(isAdminDeleteEnabled()).toBe(true);
    expect(canAdminDelete("0123456789abcdef")).toBe(true);
    expect(canAdminDelete("wrong-token")).toBe(false);
  });

  it("normalizes Next.js query token shapes", () => {
    expect(normalizeAdminToken([" token ", "ignored"])).toBe("token");
    expect(normalizeAdminToken(" token ")).toBe("token");
    expect(normalizeAdminToken(" ")).toBeUndefined();
  });
});

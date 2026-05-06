import { describe, expect, it } from "vitest";
import { parseTagline } from "@/lib/domain/manage";

describe("manage validation", () => {
  it("trims valid taglines", () => {
    expect(parseTagline("  Ship first, explain later  ")).toEqual({
      ok: true,
      tagline: "Ship first, explain later",
    });
  });

  it("rejects empty and oversized taglines", () => {
    expect(parseTagline("x").ok).toBe(false);
    expect(parseTagline("a".repeat(101)).ok).toBe(false);
  });
});

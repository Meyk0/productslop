import { describe, expect, it } from "vitest";
import {
  normalizeHttpsUrl,
  normalizeSlopperHandle,
  parseSubmissionInput,
} from "@/lib/domain/validation";

describe("submission validation", () => {
  it("accepts public https URLs and strips fragments", () => {
    expect(normalizeHttpsUrl("https://example.com/demo#section")).toEqual({
      ok: true,
      url: "https://example.com/demo",
    });
  });

  it("rejects non-https and localhost URLs", () => {
    expect(normalizeHttpsUrl("http://example.com").ok).toBe(false);
    expect(normalizeHttpsUrl("https://localhost:3000").ok).toBe(false);
  });

  it("normalizes X handles", () => {
    expect(normalizeSlopperHandle("@Meyk0")).toEqual({
      ok: true,
      handle: "@Meyk0",
    });
    expect(normalizeSlopperHandle("not valid!").ok).toBe(false);
  });

  it("rejects bot-fast submissions", () => {
    const result = parseSubmissionInput(
      {
        url: "https://example.com",
        startedAt: 10_000,
      },
      11_000,
    );

    expect(result).toEqual({
      ok: false,
      message: "Give the form a beat and try again.",
    });
  });
});

import { describe, expect, it } from "vitest";
import {
  validateSlopCopy,
  validateSubmissionEmail,
  validateSubmittedUrlDomain,
} from "@/lib/domain/abuse";

describe("abuse domain rules", () => {
  it("rejects masked URL shortener domains", () => {
    expect(validateSubmittedUrlDomain("https://bit.ly/slop").ok).toBe(false);
    expect(validateSubmittedUrlDomain("https://launch.example.com")).toEqual({ ok: true });
  });

  it("rejects disposable email domains", () => {
    expect(validateSubmissionEmail("maker@mailinator.com").ok).toBe(false);
    expect(validateSubmissionEmail("maker@example.com")).toEqual({ ok: true });
    expect(validateSubmissionEmail()).toEqual({ ok: true });
  });

  it("rejects risky or profane generated copy", () => {
    expect(
      validateSlopCopy({
        title: "Wallet Drainer Simulator",
        tagline: "Totally a weekend build",
      }).ok,
    ).toBe(false);
    expect(validateSlopCopy({ title: "Tiny CRM", tagline: "Ships leads into a spreadsheet" })).toEqual({
      ok: true,
    });
  });
});

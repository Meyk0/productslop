import { describe, expect, it } from "vitest";
import { parseReslopRequest } from "@/lib/domain/reslop";

describe("reslop validation", () => {
  it("accepts a manage token", () => {
    expect(parseReslopRequest({ manageToken: "  abcdefghijklmnop  " })).toEqual({
      ok: true,
      manageToken: "abcdefghijklmnop",
    });
  });

  it("rejects missing or short tokens", () => {
    expect(parseReslopRequest({}).ok).toBe(false);
    expect(parseReslopRequest({ manageToken: "short" }).ok).toBe(false);
  });
});

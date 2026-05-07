import { describe, expect, it } from "vitest";
import { canonicalizeSubmissionUrl } from "@/lib/domain/canonical-url";

describe("submission URL canonicalization", () => {
  it("treats root URL variants as the same app", () => {
    expect(canonicalizeSubmissionUrl("https://evalarena.xyz")).toBe("https://evalarena.xyz");
    expect(canonicalizeSubmissionUrl("https://evalarena.xyz/")).toBe("https://evalarena.xyz");
    expect(canonicalizeSubmissionUrl("https://evalarena.xyz/?utm_source=x")).toBe(
      "https://evalarena.xyz",
    );
  });

  it("keeps meaningful paths and query params but removes tracking noise", () => {
    expect(
      canonicalizeSubmissionUrl(
        "https://example.com/app/?b=2&utm_campaign=launch&a=1#result",
      ),
    ).toBe("https://example.com/app?a=1&b=2");
  });

  it("normalizes hostname case and default HTTPS ports", () => {
    expect(canonicalizeSubmissionUrl("https://WWW.STANDUPARCA.DE:443/")).toBe(
      "https://www.standuparca.de",
    );
  });
});

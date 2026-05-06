import { describe, expect, it } from "vitest";
import { fallbackMetadataForUrl, parseAiMetadataText } from "@/lib/domain/ai";

describe("AI metadata parsing", () => {
  it("extracts valid JSON from a model response", () => {
    expect(
      parseAiMetadataText(
        'Sure: {"tagline":"Ships demos before the coffee cools","type":"demo","moderation_flag":false,"moderation_reason":null}',
      ),
    ).toEqual({
      tagline: "Ships demos before the coffee cools",
      type: "demo",
      moderation_flag: false,
      moderation_reason: null,
    });
  });

  it("creates a safe fallback without external keys", () => {
    expect(fallbackMetadataForUrl("https://www.example.com/path")).toMatchObject({
      type: "demo",
      moderation_flag: false,
    });
  });
});

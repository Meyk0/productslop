import { describe, expect, it } from "vitest";
import {
  fallbackMetadataForUrl,
  fallbackReslopTagline,
  parseAiMetadataText,
  parseAiTaglineText,
} from "@/lib/domain/ai";

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

  it("extracts a reslop tagline from model JSON", () => {
    expect(parseAiTaglineText('{"tagline":"Somehow worse, somehow better."}')).toBe(
      "Somehow worse, somehow better.",
    );
  });

  it("keeps fallback reslop taglines share-card safe", () => {
    expect(
      fallbackReslopTagline({
        title: "A".repeat(120),
        url: "https://www.example.com/path",
      }).length,
    ).toBeLessThanOrEqual(100);
  });
});

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  defaultOpenAIModel,
  generateSlopMetadata,
  openAIModel,
  regenerateSlopTagline,
} from "@/lib/server/ai";
import { getOpenAIClient } from "@/lib/server/clients";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/server/clients", () => ({
  getOpenAIClient: vi.fn(),
}));

const getOpenAIClientMock = vi.mocked(getOpenAIClient);

beforeEach(() => {
  getOpenAIClientMock.mockReset();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("OpenAI AI adapter", () => {
  it("uses the configured model or the default mini model", () => {
    expect(openAIModel()).toBe(defaultOpenAIModel);

    vi.stubEnv("OPENAI_MODEL", "gpt-custom");
    expect(openAIModel()).toBe("gpt-custom");
  });

  it("falls back without an OpenAI client", async () => {
    getOpenAIClientMock.mockReturnValue(null);

    await expect(
      generateSlopMetadata({ url: "https://example.com/weekend-build" }),
    ).resolves.toMatchObject({
      type: "demo",
      moderation_flag: false,
    });
    await expect(
      regenerateSlopTagline({
        url: "https://example.com/weekend-build",
        title: "Weekend Build",
        tagline: "Old tagline",
        type: "demo",
      }),
    ).resolves.toContain("Weekend Build");
  });

  it("parses structured metadata responses", async () => {
    const parse = vi.fn().mockResolvedValue({
      output_parsed: {
        tagline: "Turns weekend energy into a questionable dashboard",
        type: "tool",
        moderation_flag: false,
        moderation_reason: null,
      },
    });
    getOpenAIClientMock.mockReturnValue({ responses: { parse } } as never);

    await expect(
      generateSlopMetadata({ url: "https://example.com", title: "Example" }),
    ).resolves.toEqual({
      tagline: "Turns weekend energy into a questionable dashboard",
      type: "tool",
      moderation_flag: false,
      moderation_reason: null,
    });
    expect(parse).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.stringContaining("glorious slop"),
        model: defaultOpenAIModel,
        reasoning: { effort: "low" },
        store: false,
      }),
    );
  });

  it("parses structured reslop tagline responses", async () => {
    const parse = vi.fn().mockResolvedValue({
      output_parsed: { tagline: "Same build, slightly less cursed." },
    });
    getOpenAIClientMock.mockReturnValue({ responses: { parse } } as never);

    await expect(
      regenerateSlopTagline({
        url: "https://example.com",
        title: "Example",
        tagline: "Old tagline",
        type: "demo",
      }),
    ).resolves.toBe("Same build, slightly less cursed.");
    expect(parse).toHaveBeenCalledWith(
      expect.objectContaining({
        instructions: expect.stringContaining("more slop-forward"),
      }),
    );
  });
});

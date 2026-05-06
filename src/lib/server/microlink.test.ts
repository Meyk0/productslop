import { afterEach, describe, expect, it, vi } from "vitest";
import { fetchProjectMetadata } from "@/lib/server/microlink";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Microlink metadata adapter", () => {
  it("uses the free endpoint without an API key", async () => {
    vi.stubEnv("MICROLINK_API_KEY", "");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          status: "success",
          data: {
            title: "Weekend Slop",
            description: "A tiny launch",
            screenshot: { url: "https://cdn.example/screenshot.png" },
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchProjectMetadata("https://example.com")).resolves.toEqual({
      title: "Weekend Slop",
      description: "A tiny launch",
      screenshotUrl: "https://cdn.example/screenshot.png",
    });

    const [url, request] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toContain("https://api.microlink.io/");
    expect(url.searchParams.get("screenshot")).toBe("true");
    expect(request.headers).toBeUndefined();
  });

  it("attaches the API key when a paid key is configured", async () => {
    vi.stubEnv("MICROLINK_API_KEY", "micro-key");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "success", data: {} }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await fetchProjectMetadata("https://example.com");

    const [, request] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(request.headers).toEqual({ "x-api-key": "micro-key" });
  });
});

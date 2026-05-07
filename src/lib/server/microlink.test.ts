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
    expect(url.searchParams.has("meta")).toBe(false);
    expect(request.headers).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(1);
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

  it("falls back to page metadata and rewrites inaccessible deployment OG images", async () => {
    vi.stubEnv("MICROLINK_API_KEY", "");
    const html = [
      "<!doctype html><html><head>",
      "<title>Fallback title</title>",
      '<meta property="og:title" content="Engram - See your AI think" />',
      '<meta name="description" content="A 3D brain visualizer." />',
      '<meta property="og:image" content="https://preview.example.com/engram-og.png" />',
      "</head><body></body></html>",
    ].join("");
    const pageResponse = new Response(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
    Object.defineProperty(pageResponse, "url", {
      value: "https://www.engramviz.com/",
    });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ status: "fail" }), {
          status: 500,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(pageResponse)
      .mockResolvedValueOnce(
        new Response("", {
          status: 401,
          headers: { "content-type": "text/html" },
        }),
      )
      .mockResolvedValueOnce(
        new Response("", {
          status: 200,
          headers: { "content-type": "image/png" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(fetchProjectMetadata("https://engramviz.com/")).resolves.toEqual({
      title: "Engram - See your AI think",
      description: "A 3D brain visualizer.",
      screenshotUrl: "https://www.engramviz.com/engram-og.png",
    });

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      "https://preview.example.com/engram-og.png",
      expect.objectContaining({ method: "HEAD" }),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      4,
      "https://www.engramviz.com/engram-og.png",
      expect.objectContaining({ method: "HEAD" }),
    );
  });
});

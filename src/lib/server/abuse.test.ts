import { afterEach, describe, expect, it, vi } from "vitest";
import { checkSafeBrowsingUrl } from "@/lib/server/abuse";

vi.mock("server-only", () => ({}));

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("Safe Browsing adapter", () => {
  it("skips when no API key is configured", async () => {
    vi.stubEnv("GOOGLE_SAFE_BROWSING_API_KEY", "");

    await expect(checkSafeBrowsingUrl("https://example.com")).resolves.toEqual({
      ok: true,
      skipped: true,
    });
  });

  it("posts the URL to threatMatches.find", async () => {
    vi.stubEnv("GOOGLE_SAFE_BROWSING_API_KEY", "safe-key");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({}), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(checkSafeBrowsingUrl("https://example.com/slop")).resolves.toEqual({
      ok: true,
      skipped: false,
    });

    const [url, request] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(url.toString()).toContain(
      "https://safebrowsing.googleapis.com/v4/threatMatches:find?key=safe-key",
    );
    expect(JSON.parse(String(request.body))).toMatchObject({
      threatInfo: {
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: "https://example.com/slop" }],
      },
    });
  });

  it("rejects URLs with Safe Browsing matches", async () => {
    vi.stubEnv("GOOGLE_SAFE_BROWSING_API_KEY", "safe-key");
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ matches: [{ threatType: "MALWARE" }] }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );

    await expect(checkSafeBrowsingUrl("https://bad.example")).resolves.toEqual({
      ok: false,
      message: "That URL is flagged by Safe Browsing.",
    });
  });
});

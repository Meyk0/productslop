import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lookup } from "node:dns/promises";
import {
  checkPublicUrlResolution,
  checkSafeBrowsingUrl,
  checkSubmissionRateLimit,
} from "@/lib/server/abuse";

vi.mock("server-only", () => ({}));
const dnsLookupMock = vi.hoisted(() => vi.fn());
vi.mock("node:dns/promises", () => ({
  default: { lookup: dnsLookupMock },
  lookup: dnsLookupMock,
}));

const lookupMock = vi.mocked(lookup);

beforeEach(() => {
  vi.clearAllMocks();
});

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

describe("submission rate limits", () => {
  it("allows a practical local seeding burst by default", () => {
    const ip = "203.0.113.50";

    for (let attempt = 0; attempt < 50; attempt += 1) {
      expect(checkSubmissionRateLimit(ip)).toMatchObject({ allowed: true });
    }

    expect(checkSubmissionRateLimit(ip)).toMatchObject({ allowed: false });
  });

  it("can be tuned with an environment variable", () => {
    vi.stubEnv("SUBMISSION_RATE_LIMIT_PER_HOUR", "2");
    const ip = "203.0.113.51";

    expect(checkSubmissionRateLimit(ip)).toMatchObject({ allowed: true });
    expect(checkSubmissionRateLimit(ip)).toMatchObject({ allowed: true });
    expect(checkSubmissionRateLimit(ip)).toMatchObject({ allowed: false });
  });
});

describe("URL resolution preflight", () => {
  it("allows hostnames that resolve to public addresses", async () => {
    lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }] as never);

    await expect(checkPublicUrlResolution("https://example.com/slop")).resolves.toEqual({
      ok: true,
    });
    expect(lookupMock).toHaveBeenCalledWith("example.com", {
      all: true,
      verbatim: true,
    });
  });

  it("rejects literal localhost and private addresses before DNS lookup", async () => {
    await expect(checkPublicUrlResolution("https://127.0.0.1/slop")).resolves.toEqual({
      ok: false,
      message: "That URL points at a private or reserved network.",
    });
    await expect(checkPublicUrlResolution("https://[::1]/slop")).resolves.toEqual({
      ok: false,
      message: "That URL points at a private or reserved network.",
    });
    expect(lookupMock).not.toHaveBeenCalled();
  });

  it("rejects hostnames that resolve to private or reserved addresses", async () => {
    lookupMock.mockResolvedValue([{ address: "10.0.0.8", family: 4 }] as never);

    await expect(checkPublicUrlResolution("https://launch.example.com")).resolves.toEqual({
      ok: false,
      message: "That URL points at a private or reserved network.",
    });
  });

  it("rejects hostnames that do not resolve", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"));

    await expect(checkPublicUrlResolution("https://missing.example")).resolves.toEqual({
      ok: false,
      message: "That URL needs to resolve publicly.",
    });
  });
});

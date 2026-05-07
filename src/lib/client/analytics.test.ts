import { afterEach, describe, expect, it, vi } from "vitest";
import { trackEvent } from "@/lib/client/analytics";

afterEach(() => {
  vi.restoreAllMocks();
  delete window.gtag;
});

describe("trackEvent", () => {
  it("sends GA events when gtag is available", () => {
    window.gtag = vi.fn();

    trackEvent("copy_link", {
      slug: "evalarena",
      source: "submit",
      skipped: undefined,
    });

    expect(window.gtag).toHaveBeenCalledWith("event", "copy_link", {
      slug: "evalarena",
      source: "submit",
    });
  });

  it("does nothing when GA has not loaded", () => {
    expect(() => trackEvent("copy_link", { slug: "evalarena" })).not.toThrow();
  });
});

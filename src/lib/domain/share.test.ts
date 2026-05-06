import { describe, expect, it } from "vitest";
import { buildLinkedInShareUrl, buildProjectUrl, buildXShareUrl } from "@/lib/domain/share";

describe("share URLs", () => {
  it("builds absolute project URLs", () => {
    expect(buildProjectUrl("https://productslop.com", "demo-123")).toBe(
      "https://productslop.com/p/demo-123",
    );
  });

  it("builds X intent URLs with the tagline and project URL", () => {
    const url = new URL(
      buildXShareUrl({
        projectUrl: "https://productslop.com/p/demo-123",
        tagline: "Ship first, explain later.",
      }),
    );

    expect(url.origin).toBe("https://twitter.com");
    expect(url.searchParams.get("url")).toBe("https://productslop.com/p/demo-123");
    expect(url.searchParams.get("text")).toContain("Ship first, explain later.");
  });

  it("builds LinkedIn share URLs", () => {
    const url = new URL(buildLinkedInShareUrl("https://productslop.com/p/demo-123"));

    expect(url.origin).toBe("https://www.linkedin.com");
    expect(url.searchParams.get("url")).toBe("https://productslop.com/p/demo-123");
  });
});

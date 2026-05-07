import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CopyLinkButton } from "@/components/copy-link-button";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  delete window.gtag;
});

describe("CopyLinkButton", () => {
  it("copies a public link and tracks the GA event", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    window.gtag = vi.fn();

    render(
      <CopyLinkButton
        url="https://productslop.com/p/evalarena"
        slug="evalarena"
        source="submit"
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /copy link/i }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith("https://productslop.com/p/evalarena"),
    );
    expect(window.gtag).toHaveBeenCalledWith("event", "copy_link", {
      slug: "evalarena",
      source: "submit",
    });
    expect(await screen.findByRole("button", { name: /copied/i })).toBeVisible();
  });

  it("shows a fallback state when clipboard access fails", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("No clipboard")) },
    });
    window.gtag = vi.fn();

    render(<CopyLinkButton url="/p/evalarena" slug="evalarena" source="detail" />);

    fireEvent.click(screen.getByRole("button", { name: /copy link/i }));

    expect(await screen.findByRole("button", { name: /copy failed/i })).toBeVisible();
    expect(window.gtag).toHaveBeenCalledWith("event", "copy_link_failed", {
      slug: "evalarena",
      source: "detail",
    });
  });
});

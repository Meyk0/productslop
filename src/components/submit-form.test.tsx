import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SubmitForm } from "@/components/submit-form";
import { requestTurnstileToken } from "@/lib/client/turnstile";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";

vi.mock("@/lib/client/turnstile", () => ({
  requestTurnstileToken: vi.fn(),
}));

const requestTurnstileTokenMock = vi.mocked(requestTurnstileToken);
const originalScrollIntoView = Element.prototype.scrollIntoView;
const originalRequestAnimationFrame = window.requestAnimationFrame;

beforeEach(() => {
  requestTurnstileTokenMock.mockResolvedValue(undefined);
  window.gtag = vi.fn();
  Element.prototype.scrollIntoView = vi.fn();
  window.requestAnimationFrame = (callback) => {
    callback(0);
    return 0;
  };
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query.includes("max-width"),
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  delete window.gtag;
  Element.prototype.scrollIntoView = originalScrollIntoView;
  window.requestAnimationFrame = originalRequestAnimationFrame;
});

describe("SubmitForm", () => {
  it("announces successful uploads, surfaces email status, and scrolls to the card", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ slop: makeSlop(), emailSent: false }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<SubmitForm />);
    fireEvent.change(screen.getByPlaceholderText("your-weekend-build.ai"), {
      target: { value: "evalarena.xyz" },
    });
    fireEvent.change(screen.getByPlaceholderText("for edit/delete link"), {
      target: { value: "maker@example.com" },
    });
    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(await screen.findByText("Slop uploaded. Card minted.")).toBeVisible();
    expect(screen.getByText("Manage link ready")).toBeVisible();
    expect(screen.getByText("Email did not send, so use the edit/delete link below.")).toBeVisible();
    expect(window.gtag).toHaveBeenCalledWith("event", "submit_success", {
      email_sent: false,
      slug: "evalarena",
      type: "tool",
    });
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(request.body as string)).toMatchObject({
      url: "evalarena.xyz",
      email: "maker@example.com",
    });
  });

  it("shows existing-card copy for duplicate submissions", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ slop: makeSlop({ email: undefined }), duplicate: true }), {
        status: 201,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const { container } = render(<SubmitForm />);
    fireEvent.change(screen.getByPlaceholderText("your-weekend-build.ai"), {
      target: { value: "evalarena.xyz/?utm_source=launch" },
    });
    fireEvent.submit(container.querySelector("form") as HTMLFormElement);

    expect(await screen.findByText("Already on the board.")).toBeVisible();
    expect(screen.getByText("We found the existing card instead of minting a duplicate.")).toBeVisible();
    expect(window.gtag).toHaveBeenCalledWith("event", "duplicate_submit", {
      email_sent: false,
      slug: "evalarena",
      type: "tool",
    });
    expect(screen.queryByText("Edit or delete this launch")).not.toBeInTheDocument();
  });
});

function makeSlop(overrides: Partial<Slop> = {}): Slop {
  return {
    id: "evalarena",
    slug: "evalarena",
    url: "https://evalarena.xyz/",
    title: "EvalArena",
    tagline: "Weekend arena for evals that get lovingly slopped by reality.",
    screenshotUrl: "https://cdn.example/evalarena.png",
    type: "tool",
    email: "maker@example.com",
    manageToken: "manage-token",
    reslopUsed: false,
    founding: false,
    createdAt: "2026-05-06T20:00:00.000Z",
    reactionCounts: createEmptyReactionCounts(),
    ...overrides,
  };
}

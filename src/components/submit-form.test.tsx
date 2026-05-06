import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
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
    expect(screen.getByText("Email is not configured here, so use the edit/delete link below.")).toBeVisible();
    await waitFor(() => expect(Element.prototype.scrollIntoView).toHaveBeenCalled());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const [, request] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(request.body as string)).toMatchObject({
      url: "evalarena.xyz",
      email: "maker@example.com",
    });
  });
});

function makeSlop(): Slop {
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
  };
}

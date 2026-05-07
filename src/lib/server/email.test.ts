import { afterEach, describe, expect, it, vi } from "vitest";
import { createEmptyReactionCounts, type Slop } from "@/lib/domain/slop";
import { getResendClient } from "@/lib/server/clients";
import { sendMagicLinkEmail } from "@/lib/server/email";

vi.mock("server-only", () => ({}));

vi.mock("@/lib/server/clients", () => ({
  getResendClient: vi.fn(),
}));

const getResendClientMock = vi.mocked(getResendClient);

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

describe("email delivery", () => {
  it("does not pretend to send without an explicit verified sender", async () => {
    const send = vi.fn();
    getResendClientMock.mockReturnValue({ emails: { send } } as never);
    vi.stubEnv("RESEND_FROM", "");

    await expect(sendMagicLinkEmail(makeSlop())).resolves.toEqual({ sent: false });
    expect(send).not.toHaveBeenCalled();
  });

  it("sends manage links with the configured sender and site URL", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "email-id" } });
    getResendClientMock.mockReturnValue({ emails: { send } } as never);
    vi.stubEnv("RESEND_FROM", "Product Slop <verified@example.com>");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://productslop.vercel.app");

    await expect(sendMagicLinkEmail(makeSlop())).resolves.toEqual({ sent: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: "Product Slop <verified@example.com>",
        to: "maker@example.com",
        text: expect.stringContaining("https://productslop.vercel.app/manage/manage-token"),
      }),
    );
  });

  it("falls back to Vercel production URLs for manage links", async () => {
    const send = vi.fn().mockResolvedValue({ data: { id: "email-id" } });
    getResendClientMock.mockReturnValue({ emails: { send } } as never);
    vi.stubEnv("RESEND_FROM", "Product Slop <verified@example.com>");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "productslop.vercel.app");

    await expect(sendMagicLinkEmail(makeSlop())).resolves.toEqual({ sent: true });
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        text: expect.stringContaining("https://productslop.vercel.app/manage/manage-token"),
      }),
    );
  });

  it("reports unsent when Resend returns an SDK error", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    const send = vi.fn().mockResolvedValue({
      data: null,
      error: {
        message: "Domain is not verified",
        name: "validation_error",
      },
    });
    getResendClientMock.mockReturnValue({ emails: { send } } as never);
    vi.stubEnv("RESEND_FROM", "Product Slop <unverified@example.com>");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://productslop.vercel.app");

    await expect(sendMagicLinkEmail(makeSlop())).resolves.toEqual({ sent: false });
    expect(consoleError).toHaveBeenCalledWith(
      "Resend rejected Product Slop magic link",
      expect.objectContaining({ message: "Domain is not verified" }),
    );
  });

  it("reports unsent when Resend does not return a message id", async () => {
    const send = vi.fn().mockResolvedValue({ data: null, error: null });
    getResendClientMock.mockReturnValue({ emails: { send } } as never);
    vi.stubEnv("RESEND_FROM", "Product Slop <verified@example.com>");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://productslop.vercel.app");

    await expect(sendMagicLinkEmail(makeSlop())).resolves.toEqual({ sent: false });
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

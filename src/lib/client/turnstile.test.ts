import { afterEach, describe, expect, it, vi } from "vitest";
import { requestTurnstileToken, TURNSTILE_SCRIPT_SRC } from "@/lib/client/turnstile";

afterEach(() => {
  document.body.innerHTML = "";
  document.head.innerHTML = "";
  window.turnstile = undefined;
  vi.restoreAllMocks();
});

describe("Turnstile client", () => {
  it("skips token requests when no site key is configured", async () => {
    await expect(requestTurnstileToken(undefined, "submit")).resolves.toBeUndefined();
  });

  it("renders and executes an invisible widget when Turnstile is loaded", async () => {
    let callback: ((token: string) => void) | undefined;
    window.turnstile = {
      render: vi.fn((_container, options) => {
        callback = options.callback;
        return "widget-id";
      }),
      execute: vi.fn(() => callback?.("token-123")),
      remove: vi.fn(),
    };

    await expect(requestTurnstileToken("site-key", "submit")).resolves.toBe("token-123");
    expect(window.turnstile.render).toHaveBeenCalledWith(
      expect.any(HTMLElement),
      expect.objectContaining({
        action: "submit",
        execution: "execute",
        size: "invisible",
        sitekey: "site-key",
      }),
    );
    expect(window.turnstile.execute).toHaveBeenCalledWith("widget-id");
    expect(window.turnstile.remove).toHaveBeenCalledWith("widget-id");
  });

  it("loads the explicit-rendering Turnstile script", async () => {
    const tokenPromise = requestTurnstileToken("site-key", "reaction");
    const script = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
    );

    expect(script).not.toBeNull();

    let callback: ((token: string) => void) | undefined;
    window.turnstile = {
      render: vi.fn((_container, options) => {
        callback = options.callback;
        return "widget-id";
      }),
      execute: vi.fn(() => callback?.("token-456")),
      remove: vi.fn(),
    };
    script?.dispatchEvent(new Event("load"));

    await expect(tokenPromise).resolves.toBe("token-456");
  });
});

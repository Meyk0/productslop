export const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileRenderOptions = {
  sitekey: string;
  action: string;
  appearance: "execute";
  execution: "execute";
  size: "invisible";
  callback: (token: string) => void;
  "error-callback": () => void;
  "expired-callback": () => void;
  "timeout-callback": () => void;
};

type TurnstileApi = {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string;
  execute: (widgetId: string) => void;
  remove?: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

let scriptPromise: Promise<void> | null = null;

export async function requestTurnstileToken(
  siteKey: string | undefined,
  action: string,
): Promise<string | undefined> {
  const normalizedSiteKey = siteKey?.trim();
  if (!normalizedSiteKey || typeof window === "undefined") {
    return undefined;
  }

  await loadTurnstileScript();

  if (!window.turnstile) {
    throw new Error("Captcha is still loading. Try again.");
  }

  const turnstile = window.turnstile;

  return new Promise((resolve, reject) => {
    const container = ensureTurnstileContainer();
    let widgetId: string | undefined;
    const timeoutId = window.setTimeout(() => {
      cleanup();
      reject(new Error("Captcha timed out. Try again."));
    }, 15_000);

    function cleanup() {
      window.clearTimeout(timeoutId);
      if (widgetId) {
        turnstile.remove?.(widgetId);
      }
    }

    try {
      widgetId = turnstile.render(container, {
        sitekey: normalizedSiteKey,
        action,
        appearance: "execute",
        execution: "execute",
        size: "invisible",
        callback: (token) => {
          cleanup();
          resolve(token);
        },
        "error-callback": () => {
          cleanup();
          reject(new Error("Captcha verification failed."));
        },
        "expired-callback": () => {
          cleanup();
          reject(new Error("Captcha expired. Try again."));
        },
        "timeout-callback": () => {
          cleanup();
          reject(new Error("Captcha timed out. Try again."));
        },
      });
      turnstile.execute(widgetId);
    } catch (error) {
      cleanup();
      reject(error);
    }
  });
}

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Captcha failed to load.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Captcha failed to load."));
    document.head.append(script);
  }).catch((error) => {
    scriptPromise = null;
    throw error;
  });

  return scriptPromise;
}

function ensureTurnstileContainer(): HTMLElement {
  const existingContainer = document.getElementById("productslop-turnstile");
  if (existingContainer) {
    return existingContainer;
  }

  const container = document.createElement("div");
  container.id = "productslop-turnstile";
  container.hidden = true;
  document.body.append(container);
  return container;
}

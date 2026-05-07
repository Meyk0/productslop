type AnalyticsValue = string | number | boolean | null | undefined;
type AnalyticsParams = Record<string, AnalyticsValue>;

declare global {
  interface Window {
    gtag?: (command: "event", eventName: string, params?: Record<string, Exclude<AnalyticsValue, undefined>>) => void;
  }
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, cleanParams(params));
}

function cleanParams(params: AnalyticsParams): Record<string, Exclude<AnalyticsValue, undefined>> {
  return Object.fromEntries(
    Object.entries(params).filter((entry): entry is [string, Exclude<AnalyticsValue, undefined>] => entry[1] !== undefined),
  );
}

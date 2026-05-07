const trackingParams = new Set([
  "fbclid",
  "gclid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "msclkid",
  "ref",
  "ref_src",
  "source",
]);

export function canonicalizeSubmissionUrl(rawUrl: string): string {
  const url = new URL(rawUrl);
  const path = normalizePathname(url.pathname);
  const query = normalizeSearchParams(url.searchParams);
  const origin = `${url.protocol.toLowerCase()}//${url.hostname.toLowerCase()}${normalizedPort(url)}`;

  return `${origin}${path}${query}`;
}

function normalizePathname(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/g, "");
  return trimmed === "" ? "" : trimmed;
}

function normalizeSearchParams(params: URLSearchParams): string {
  const entries = Array.from(params.entries())
    .filter(([name]) => !isTrackingParam(name))
    .sort(([leftName, leftValue], [rightName, rightValue]) => {
      const nameOrder = leftName.localeCompare(rightName);
      return nameOrder === 0 ? leftValue.localeCompare(rightValue) : nameOrder;
    });

  if (entries.length === 0) {
    return "";
  }

  const normalized = new URLSearchParams();
  for (const [name, value] of entries) {
    normalized.append(name, value);
  }

  return `?${normalized.toString()}`;
}

function isTrackingParam(name: string): boolean {
  const normalized = name.toLowerCase();
  return normalized.startsWith("utm_") || trackingParams.has(normalized);
}

function normalizedPort(url: URL): string {
  if (!url.port || (url.protocol === "https:" && url.port === "443")) {
    return "";
  }

  return `:${url.port}`;
}

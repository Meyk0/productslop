import "server-only";

export type ProjectMetadata = {
  title?: string;
  description?: string;
  screenshotUrl?: string;
};

type MicrolinkResponse = {
  status?: string;
  data?: {
    title?: string;
    description?: string;
    image?: { url?: string };
    screenshot?: { url?: string };
  };
};

export async function fetchProjectMetadata(url: string): Promise<ProjectMetadata> {
  const microlinkMetadata = await fetchMicrolinkMetadata(url);
  if (microlinkMetadata.title && microlinkMetadata.description && microlinkMetadata.screenshotUrl) {
    return microlinkMetadata;
  }

  const htmlMetadata = await fetchHtmlMetadata(url);
  return {
    title: microlinkMetadata.title ?? htmlMetadata.title,
    description: microlinkMetadata.description ?? htmlMetadata.description,
    screenshotUrl: microlinkMetadata.screenshotUrl ?? htmlMetadata.screenshotUrl,
  };
}

async function fetchMicrolinkMetadata(url: string): Promise<ProjectMetadata> {
  const apiKey = process.env.MICROLINK_API_KEY?.trim();

  const endpoint = new URL("https://api.microlink.io/");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("screenshot", "true");
  const headers = apiKey ? { "x-api-key": apiKey } : undefined;

  const response = await fetch(endpoint, { headers });

  if (!response.ok) {
    return {};
  }

  const payload = (await response.json()) as MicrolinkResponse;
  if (payload.status !== "success") {
    return {};
  }

  return {
    title: payload.data?.title,
    description: payload.data?.description,
    screenshotUrl: payload.data?.screenshot?.url ?? payload.data?.image?.url,
  };
}

async function fetchHtmlMetadata(url: string): Promise<ProjectMetadata> {
  let response: Response;
  try {
    response = await fetch(url, {
      cache: "no-store",
      headers: {
        accept: "text/html,application/xhtml+xml",
        "user-agent": "ProductSlopBot/0.1 (+https://productslop.com)",
      },
      redirect: "follow",
    });
  } catch {
    return {};
  }

  const contentType = response.headers.get("content-type") ?? "";
  if (!response.ok || !contentType.includes("text/html")) {
    return {};
  }

  const html = await response.text();
  const pageUrl = response.url || url;
  const image = firstPresentMeta(html, [
    "og:image",
    "og:image:secure_url",
    "twitter:image",
    "twitter:image:src",
  ]);

  return {
    title:
      firstPresentMeta(html, ["og:title", "twitter:title"]) ?? extractTitle(html),
    description: firstPresentMeta(html, [
      "description",
      "og:description",
      "twitter:description",
    ]),
    screenshotUrl: image
      ? await selectReachableImageUrl(buildImageCandidates(image, pageUrl))
      : undefined,
  };
}

function firstPresentMeta(html: string, names: string[]): string | undefined {
  const wantedNames = new Set(names.map((name) => name.toLowerCase()));

  for (const match of html.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = parseAttributes(match[0]);
    const key = attributes.property?.toLowerCase() ?? attributes.name?.toLowerCase();
    const content = attributes.content?.trim();

    if (key && wantedNames.has(key) && content) {
      return decodeHtml(content);
    }
  }

  return undefined;
}

function parseAttributes(tag: string): Record<string, string> {
  const attributes: Record<string, string> = {};
  const pattern = /([^\s=/"'>]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/g;

  for (const match of tag.matchAll(pattern)) {
    const [, name, doubleQuoted, singleQuoted, unquoted] = match;
    if (name) {
      attributes[name.toLowerCase()] = doubleQuoted ?? singleQuoted ?? unquoted ?? "";
    }
  }

  return attributes;
}

function extractTitle(html: string): string | undefined {
  const title = html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  return title ? decodeHtml(title.replace(/<[^>]+>/g, "")) : undefined;
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&quot;/g, "\"")
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function buildImageCandidates(rawImageUrl: string, pageUrl: string): string[] {
  const candidates = new Set<string>();

  try {
    const resolvedImageUrl = new URL(rawImageUrl, pageUrl);
    candidates.add(resolvedImageUrl.toString());

    const pageOrigin = new URL(pageUrl).origin;
    if (resolvedImageUrl.origin !== pageOrigin) {
      candidates.add(new URL(`${resolvedImageUrl.pathname}${resolvedImageUrl.search}`, pageOrigin).toString());
    }
  } catch {
    return [];
  }

  return [...candidates];
}

async function selectReachableImageUrl(candidates: string[]): Promise<string | undefined> {
  for (const candidate of candidates) {
    if (await isReachableImage(candidate)) {
      return candidate;
    }
  }

  return undefined;
}

async function isReachableImage(url: string): Promise<boolean> {
  const headProbe = await probeImage(url, "HEAD");
  if (headProbe !== "unknown") {
    return headProbe;
  }

  return (await probeImage(url, "GET")) === true;
}

async function probeImage(url: string, method: "GET" | "HEAD"): Promise<boolean | "unknown"> {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: method === "GET" ? { range: "bytes=0-0" } : undefined,
      method,
      redirect: "follow",
      signal: AbortSignal.timeout(5_000),
    });
    await response.body?.cancel();

    const contentType = response.headers.get("content-type");
    if (!response.ok && response.status !== 206) {
      return false;
    }

    return contentType ? contentType.startsWith("image/") : true;
  } catch {
    return method === "HEAD" ? "unknown" : false;
  }
}

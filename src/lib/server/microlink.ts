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
  const apiKey = process.env.MICROLINK_API_KEY;
  if (!apiKey) {
    return {};
  }

  const endpoint = new URL("https://api.microlink.io/");
  endpoint.searchParams.set("url", url);
  endpoint.searchParams.set("screenshot", "true");
  endpoint.searchParams.set("meta", "false");

  const response = await fetch(endpoint, {
    headers: {
      "x-api-key": apiKey,
    },
  });

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

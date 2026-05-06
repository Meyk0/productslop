export function buildProjectUrl(siteUrl: string, slug: string): string {
  return new URL(`/p/${slug}`, normalizeSiteUrl(siteUrl)).toString();
}

export function buildXShareUrl(params: { projectUrl: string; tagline: string }): string {
  const url = new URL("https://twitter.com/intent/tweet");
  url.searchParams.set("text", `just shipped some slop\n\n${params.tagline}`);
  url.searchParams.set("url", params.projectUrl);
  return url.toString();
}

export function buildLinkedInShareUrl(projectUrl: string): string {
  const url = new URL("https://www.linkedin.com/sharing/share-offsite/");
  url.searchParams.set("url", projectUrl);
  return url.toString();
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.endsWith("/") ? siteUrl : `${siteUrl}/`;
}

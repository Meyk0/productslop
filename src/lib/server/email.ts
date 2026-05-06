import "server-only";

import type { Slop } from "@/lib/domain/slop";
import { getResendClient } from "@/lib/server/clients";

export async function sendMagicLinkEmail(slop: Slop): Promise<{ sent: boolean }> {
  if (!slop.email || !slop.manageToken) {
    return { sent: false };
  }

  const resend = getResendClient();
  const from = process.env.RESEND_FROM?.trim();
  if (!resend || !from) {
    return { sent: false };
  }

  const siteUrl = resolveSiteUrl();
  const manageUrl = new URL(`/manage/${slop.manageToken}`, siteUrl);

  await resend.emails.send({
    from,
    to: slop.email,
    subject: `Manage ${slop.title} on Product Slop`,
    text: [
      `Your slop is live: ${new URL(`/p/${slop.slug}`, siteUrl).toString()}`,
      "",
      `Edit or delete it here: ${manageUrl.toString()}`,
    ].join("\n"),
  });

  return { sent: true };
}

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) {
    return withProtocol(explicit);
  }

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (productionUrl) {
    return withProtocol(productionUrl);
  }

  const deploymentUrl = process.env.VERCEL_URL?.trim();
  if (deploymentUrl) {
    return withProtocol(deploymentUrl);
  }

  return "http://localhost:3000";
}

function withProtocol(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

import "server-only";

import type { Slop } from "@/lib/domain/slop";
import { getResendClient } from "@/lib/server/clients";

export async function sendMagicLinkEmail(slop: Slop): Promise<{ sent: boolean }> {
  if (!slop.email || !slop.manageToken) {
    return { sent: false };
  }

  const resend = getResendClient();
  if (!resend) {
    return { sent: false };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const manageUrl = new URL(`/manage/${slop.manageToken}`, siteUrl);

  await resend.emails.send({
    from: process.env.RESEND_FROM ?? "Product Slop <launch@productslop.com>",
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

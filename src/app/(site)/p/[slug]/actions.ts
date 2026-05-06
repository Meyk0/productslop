"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canAdminDelete } from "@/lib/server/admin";
import { deleteSlopBySlugAsAdmin } from "@/lib/server/slop-service";

export async function adminDeleteSlopAction(slug: string, adminToken: string) {
  if (!canAdminDelete(adminToken)) {
    redirect(`/p/${slug}?adminError=Admin%20delete%20is%20not%20enabled.`);
  }

  try {
    await deleteSlopBySlugAsAdmin(slug);
  } catch (error) {
    redirect(`/p/${slug}?adminError=${encodeURIComponent(errorMessage(error))}`);
  }

  revalidatePath(`/p/${slug}`);
  revalidatePath("/");
  revalidatePath("/hall-of-slop");
  redirect("/?deleted=1");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to delete this slop.";
}

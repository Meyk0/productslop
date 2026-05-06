"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteSlopByToken,
  updateSlopTaglineByToken,
} from "@/lib/server/slop-service";

export async function updateTaglineAction(token: string, formData: FormData) {
  let slug: string;

  try {
    const slop = await updateSlopTaglineByToken(token, formData.get("tagline"));
    slug = slop.slug;
  } catch (error) {
    redirect(`/manage/${token}?error=${encodeURIComponent(errorMessage(error))}`);
  }

  revalidatePath(`/manage/${token}`);
  revalidatePath(`/p/${slug}`);
  revalidatePath("/");
  redirect(`/manage/${token}?updated=1`);
}

export async function deleteSlopAction(token: string) {
  try {
    await deleteSlopByToken(token);
  } catch (error) {
    redirect(`/manage/${token}?error=${encodeURIComponent(errorMessage(error))}`);
  }

  revalidatePath(`/manage/${token}`);
  revalidatePath("/");
  redirect("/?deleted=1");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unable to update this slop.";
}

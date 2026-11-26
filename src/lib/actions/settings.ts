"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { PageSeo } from "@/lib/types";
import { friendlyDbError } from "@/lib/saveGuard";

// Il resto delle impostazioni si salva a gruppi in ./siteSettings.ts.

type FormState = { error: string | null; success?: boolean };

export async function updatePageSeo(
  pageKey: PageSeo["page_key"],
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = {
    seo_title: String(formData.get("seo_title") || "").trim(),
    seo_description: String(formData.get("seo_description") || "").trim(),
    seo_og_image: String(formData.get("seo_og_image") || "").trim() || null,
    seo_noindex: formData.get("seo_noindex") === "on",
  };

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("page_seo")
    .upsert({ page_key: pageKey, ...payload });

  if (error) return { error: friendlyDbError(error) };

  revalidatePath("/");
  revalidatePath("/admin/homepage");
  return { error: null, success: true };
}

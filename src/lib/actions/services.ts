"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { ContentBlock, ContentStatus, ServiceFaq } from "@/lib/types";

type FormState = { error: string | null; success?: boolean };

function parseJson<T>(value: FormDataEntryValue | null): T[] {
  try {
    const parsed = JSON.parse(String(value || "[]"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function parseServiceForm(formData: FormData) {
  return {
    slug: String(formData.get("slug") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    excerpt: String(formData.get("excerpt") || "").trim(),
    intro: String(formData.get("intro") || "").trim(),
    content_blocks: parseJson<ContentBlock>(formData.get("content_blocks")),
    faqs: parseJson<ServiceFaq>(formData.get("faqs")).filter(
      (f) => f.question?.trim() && f.answer?.trim(),
    ),
    related_project_slugs: formData.getAll("related_project_slugs").map(String),
    area_served: String(formData.get("area_served") || "").trim(),
    sort_order: Number(formData.get("sort_order")) || 0,
    status: String(formData.get("status") || "draft") as ContentStatus,
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    seo_description:
      String(formData.get("seo_description") || "").trim() || null,
    seo_og_image: String(formData.get("seo_og_image") || "").trim() || null,
    seo_noindex: formData.get("seo_noindex") === "on",
  };
}

// Il footer di ogni pagina elenca i servizi e le pagine dei progetti
// mostrano quelli correlati: si aggiorna tutto il sito, non solo /servizi.
function revalidateServicePages(slug?: string) {
  revalidatePath("/", "layout");
  revalidatePath("/servizi");
  if (slug) revalidatePath(`/servizi/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/servizi");
}

export async function createService(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = parseServiceForm(formData);
  if (!payload.slug || !payload.title) {
    return { error: "Slug e titolo sono obbligatori." };
  }

  const supabase = await createAdminClient();
  const { data: created, error } = await supabase
    .from("service_pages")
    .insert(payload)
    .select("id")
    .single();
  if (error) return { error: error.message };

  revalidateServicePages(payload.slug);
  // Dopo la creazione si apre subito la pagina di modifica del nuovo
  // contenuto, invece di tornare all'elenco.
  redirect(
    created ? `/admin/servizi/${created.id}?salvato=1` : "/admin/servizi",
  );
}

export async function updateService(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = parseServiceForm(formData);
  if (!payload.slug || !payload.title) {
    return { error: "Slug e titolo sono obbligatori." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("service_pages")
    .update(payload)
    .eq("id", id);
  if (error) return { error: error.message };

  revalidateServicePages(payload.slug);
  return { error: null, success: true };
}

export async function duplicateService(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createAdminClient();
  const { data: original, error } = await supabase
    .from("service_pages")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !original) return;

  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...rest
  } = original;

  await supabase.from("service_pages").insert({
    ...rest,
    slug: `${rest.slug}-copia-${Date.now().toString(36)}`,
    title: `${rest.title} (copia)`,
    status: "draft",
  });

  revalidatePath("/admin/servizi");
}

export async function deleteService(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createAdminClient();
  await supabase.from("service_pages").delete().eq("id", id);

  revalidateServicePages();
}

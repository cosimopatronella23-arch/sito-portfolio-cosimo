"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ContentBlock, ContentStatus, GalleryItem } from "@/lib/types";

type FormState = { error: string | null };

function parseProjectForm(formData: FormData) {
  let contentBlocks: ContentBlock[] = [];
  try {
    contentBlocks = JSON.parse(String(formData.get("content_blocks") || "[]"));
  } catch {
    contentBlocks = [];
  }

  let gallery: GalleryItem[] = [];
  try {
    gallery = JSON.parse(String(formData.get("gallery") || "[]"));
  } catch {
    gallery = [];
  }
  gallery = gallery.filter((item) => item.url);

  return {
    slug: String(formData.get("slug") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    client: String(formData.get("client") || "").trim(),
    year: Number(formData.get("year")) || new Date().getFullYear(),
    cover_image: String(formData.get("cover_image") || "") || null,
    gallery,
    short_description: String(formData.get("short_description") || "").trim(),
    content_blocks: contentBlocks,
    external_link: String(formData.get("external_link") || "").trim() || null,
    featured: formData.get("featured") === "on",
    sort_order: Number(formData.get("sort_order")) || 0,
    status: String(formData.get("status") || "draft") as ContentStatus,
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    seo_description:
      String(formData.get("seo_description") || "").trim() || null,
    seo_og_image: String(formData.get("seo_og_image") || "").trim() || null,
    seo_noindex: formData.get("seo_noindex") === "on",
  };
}

// "sort_order" esiste nel codice da subito, ma sul database compare solo
// dopo aver eseguito la migrazione 0007 in Supabase Studio. Nella finestra
// di tempo prima che venga eseguita, salvare un progetto non deve rompersi
// per gli altri campi: se l'errore è proprio "colonna non trovata", si
// ritenta senza sort_order.
function isMissingSortOrderColumn(error: { code: string; message: string } | null) {
  return (
    !!error &&
    (error.code === "PGRST204" || error.code === "42703") &&
    error.message.includes("sort_order")
  );
}

export async function createProject(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = parseProjectForm(formData);
  if (!payload.slug || !payload.title) {
    return { error: "Slug e titolo sono obbligatori." };
  }

  const supabase = await createClient();
  let { error } = await supabase.from("projects").insert(payload);

  if (isMissingSortOrderColumn(error)) {
    const { sort_order: _sortOrder, ...withoutSortOrder } = payload;
    ({ error } = await supabase.from("projects").insert(withoutSortOrder));
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/progetti");
  revalidatePath("/admin/progetti");
  redirect("/admin/progetti");
}

export async function updateProject(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = parseProjectForm(formData);
  if (!payload.slug || !payload.title) {
    return { error: "Slug e titolo sono obbligatori." };
  }

  const supabase = await createClient();
  let { error } = await supabase
    .from("projects")
    .update(payload)
    .eq("id", id);

  if (isMissingSortOrderColumn(error)) {
    const { sort_order: _sortOrder, ...withoutSortOrder } = payload;
    ({ error } = await supabase
      .from("projects")
      .update(withoutSortOrder)
      .eq("id", id));
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/progetti");
  revalidatePath(`/progetti/${payload.slug}`);
  revalidatePath("/admin/progetti");
  redirect("/admin/progetti");
}

export async function duplicateProject(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  const { data: original, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !original) return;

  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...rest
  } = original;

  await supabase.from("projects").insert({
    ...rest,
    slug: `${rest.slug}-copia-${Date.now().toString(36)}`,
    title: `${rest.title} (copia)`,
    status: "draft",
  });

  revalidatePath("/admin/progetti");
}

export async function deleteProject(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createClient();
  await supabase.from("projects").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/progetti");
  revalidatePath("/admin/progetti");
}

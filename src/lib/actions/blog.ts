"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/types";

type FormState = { error: string | null };

function parsePostForm(formData: FormData) {
  const publishedAtRaw = String(formData.get("published_at") || "");
  const publishedAt = publishedAtRaw
    ? new Date(publishedAtRaw).toISOString()
    : new Date().toISOString();

  return {
    slug: String(formData.get("slug") || "").trim(),
    title: String(formData.get("title") || "").trim(),
    category: String(formData.get("category") || "").trim(),
    cover_image: String(formData.get("cover_image") || "") || null,
    excerpt: String(formData.get("excerpt") || "").trim(),
    content: String(formData.get("content") || ""),
    status: String(formData.get("status") || "draft") as ContentStatus,
    published_at: publishedAt,
    sort_order: Number(formData.get("sort_order")) || 0,
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    seo_description:
      String(formData.get("seo_description") || "").trim() || null,
    seo_og_image: String(formData.get("seo_og_image") || "").trim() || null,
    seo_noindex: formData.get("seo_noindex") === "on",
  };
}

// "sort_order" esiste nel codice da subito, ma sul database compare solo
// dopo aver eseguito la migrazione 0006 in Supabase Studio. Nella finestra
// di tempo prima che venga eseguita, salvare un articolo non deve rompersi
// per gli altri campi: se l'errore è proprio "colonna non trovata", si
// ritenta senza sort_order.
function isMissingSortOrderColumn(error: { code: string; message: string } | null) {
  return (
    !!error &&
    (error.code === "PGRST204" || error.code === "42703") &&
    error.message.includes("sort_order")
  );
}

export async function createPost(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = parsePostForm(formData);
  if (!payload.slug || !payload.title) {
    return { error: "Slug e titolo sono obbligatori." };
  }

  const supabase = await createAdminClient();
  let { error } = await supabase.from("blog_posts").insert(payload);

  if (isMissingSortOrderColumn(error)) {
    const { sort_order: _sortOrder, ...withoutSortOrder } = payload;
    ({ error } = await supabase.from("blog_posts").insert(withoutSortOrder));
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function updatePost(
  id: string,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = parsePostForm(formData);
  if (!payload.slug || !payload.title) {
    return { error: "Slug e titolo sono obbligatori." };
  }

  const supabase = await createAdminClient();
  let { error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id);

  if (isMissingSortOrderColumn(error)) {
    const { sort_order: _sortOrder, ...withoutSortOrder } = payload;
    ({ error } = await supabase
      .from("blog_posts")
      .update(withoutSortOrder)
      .eq("id", id));
  }

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath(`/blog/${payload.slug}`);
  revalidatePath("/admin/blog");
  redirect("/admin/blog");
}

export async function duplicatePost(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createAdminClient();
  const { data: original, error: fetchError } = await supabase
    .from("blog_posts")
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

  await supabase.from("blog_posts").insert({
    ...rest,
    slug: `${rest.slug}-copia-${Date.now().toString(36)}`,
    title: `${rest.title} (copia)`,
    status: "draft",
  });

  revalidatePath("/admin/blog");
}

export async function deletePost(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!id) return;

  const supabase = await createAdminClient();
  await supabase.from("blog_posts").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

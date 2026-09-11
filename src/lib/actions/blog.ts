"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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
    seo_title: String(formData.get("seo_title") || "").trim() || null,
    seo_description:
      String(formData.get("seo_description") || "").trim() || null,
    seo_og_image: String(formData.get("seo_og_image") || "").trim() || null,
    seo_noindex: formData.get("seo_noindex") === "on",
  };
}

export async function createPost(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = parsePostForm(formData);
  if (!payload.slug || !payload.title) {
    return { error: "Slug e titolo sono obbligatori." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("blog_posts").insert(payload);

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

  const supabase = await createClient();
  const { error } = await supabase
    .from("blog_posts")
    .update(payload)
    .eq("id", id);

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

  const supabase = await createClient();
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

  const supabase = await createClient();
  await supabase.from("blog_posts").delete().eq("id", id);

  revalidatePath("/");
  revalidatePath("/blog");
  revalidatePath("/admin/blog");
}

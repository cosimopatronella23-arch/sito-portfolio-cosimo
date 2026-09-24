"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

export interface MediaFile {
  name: string;
  url: string;
  size: number;
  createdAt: string | null;
}

/** Elenca tutti i file nel bucket "media" di Supabase Storage. */
export async function listMediaFiles(): Promise<MediaFile[]> {
  const supabase = await createAdminClient();
  const { data, error } = await supabase.storage
    .from("media")
    .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });

  if (error || !data) return [];

  return data
    .filter((file) => file.name && !file.name.endsWith("/"))
    .map((file) => {
      const { data: pub } = supabase.storage.from("media").getPublicUrl(file.name);
      return {
        name: file.name,
        url: pub.publicUrl,
        size: file.metadata?.size ?? 0,
        createdAt: file.created_at ?? null,
      };
    });
}

/**
 * Controlla se un'immagine è ancora usata da qualche parte sul sito, prima
 * di permetterne la cancellazione. Guarda progetti, articoli, impostazioni
 * (homepage/blocchi/favicon) e SEO della homepage.
 */
export async function checkMediaUsage(url: string): Promise<string[]> {
  const supabase = await createAdminClient();
  const usages: string[] = [];

  const [projectsRes, postsRes, settingsRes, pageSeoRes] = await Promise.all([
    supabase.from("projects").select("title, cover_image, gallery, seo_og_image"),
    supabase.from("blog_posts").select("title, cover_image, seo_og_image, content"),
    supabase.from("site_settings").select("favicon, home_content"),
    supabase.from("page_seo").select("page_key, seo_og_image"),
  ]);

  for (const p of projectsRes.data ?? []) {
    const gallery = (p.gallery ?? []) as { url?: string }[];
    if (
      p.cover_image === url ||
      p.seo_og_image === url ||
      gallery.some((item) => item?.url === url)
    ) {
      usages.push(`Progetto: "${p.title}"`);
    }
  }

  for (const post of postsRes.data ?? []) {
    if (
      post.cover_image === url ||
      post.seo_og_image === url ||
      (post.content ?? "").includes(url)
    ) {
      usages.push(`Articolo: "${post.title}"`);
    }
  }

  for (const s of settingsRes.data ?? []) {
    if (s.favicon === url || JSON.stringify(s.home_content ?? {}).includes(url)) {
      usages.push("Impostazioni sito (homepage, blocchi o footer)");
    }
  }

  for (const seo of pageSeoRes.data ?? []) {
    if (seo.seo_og_image === url) {
      usages.push(`SEO della pagina "${seo.page_key}"`);
    }
  }

  return usages;
}

/** Elimina definitivamente un file dal bucket "media". Irreversibile. */
export async function deleteMediaFile(
  name: string,
): Promise<{ error: string | null }> {
  const supabase = await createAdminClient();
  const { error } = await supabase.storage.from("media").remove([name]);

  if (error) return { error: error.message };

  revalidatePath("/admin/media");
  return { error: null };
}

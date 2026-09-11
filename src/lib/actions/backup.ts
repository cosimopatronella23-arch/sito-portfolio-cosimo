"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Esporta tutti i contenuti gestiti da /admin in un unico oggetto JSON.
 * Sola lettura: nessuna scrittura sul database. Pensato come backup manuale
 * da scaricare ogni tanto, dato che il piano gratuito di Supabase non
 * garantisce backup automatici.
 */
export async function exportSiteData(): Promise<string> {
  const supabase = await createClient();

  const [projects, blogPosts, siteSettings, pageSeo] = await Promise.all([
    supabase.from("projects").select("*").order("created_at"),
    supabase.from("blog_posts").select("*").order("created_at"),
    supabase.from("site_settings").select("*"),
    supabase.from("page_seo").select("*"),
  ]);

  return JSON.stringify(
    {
      exported_at: new Date().toISOString(),
      projects: projects.data ?? [],
      blog_posts: blogPosts.data ?? [],
      site_settings: siteSettings.data ?? [],
      page_seo: pageSeo.data ?? [],
    },
    null,
    2,
  );
}

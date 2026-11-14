"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { friendlyDbError } from "@/lib/saveGuard";

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

type UsageSource = { label: string; text: string };

/**
 * Raccoglie tutto il contenuto del sito che può contenere un file: progetti,
 * articoli, pagine servizio, impostazioni (homepage, blocchi, recensioni,
 * favicon) e SEO delle pagine. Ogni riga viene letta per intero, così un
 * campo nuovo è coperto senza doverlo aggiungere qui. Cestino e versioni
 * precedenti non contano: lì un file vecchio non è più visibile sul sito.
 */
async function loadUsageSources(): Promise<UsageSource[]> {
  const supabase = await createAdminClient();
  const [projectsRes, postsRes, servicesRes, settingsRes, pageSeoRes] =
    await Promise.all([
      supabase.from("projects").select("*"),
      supabase.from("blog_posts").select("*"),
      supabase.from("service_pages").select("*"),
      supabase.from("site_settings").select("*"),
      supabase.from("page_seo").select("*"),
    ]);

  const rows = (
    data: Record<string, unknown>[] | null,
    label: (row: Record<string, unknown>) => string,
  ) => (data ?? []).map((row) => ({ label: label(row), text: JSON.stringify(row) }));

  return [
    ...rows(projectsRes.data, (r) => `Progetto: "${r.title}"`),
    ...rows(postsRes.data, (r) => `Articolo: "${r.title}"`),
    ...rows(servicesRes.data, (r) => `Pagina servizio: "${r.title}"`),
    ...rows(settingsRes.data, () => "Impostazioni sito (homepage, blocchi o footer)"),
    ...rows(pageSeoRes.data, (r) => `SEO della pagina "${r.page_key}"`),
  ];
}

/** Il pezzo di indirizzo che identifica il file, qualunque sia il dominio. */
function fileKey(url: string): string {
  const marker = "/storage/v1/object/public/media/";
  const i = url.indexOf(marker);
  return i >= 0 ? url.slice(i) : url;
}

/**
 * Controlla se un file è ancora usato da qualche parte sul sito, prima di
 * permetterne la cancellazione.
 */
export async function checkMediaUsage(url: string): Promise<string[]> {
  const key = fileKey(url);
  const sources = await loadUsageSources();
  return [
    ...new Set(sources.filter((s) => s.text.includes(key)).map((s) => s.label)),
  ];
}

/** Indirizzi dei file che non risultano usati in nessuna pagina del sito. */
export async function findUnusedMedia(urls: string[]): Promise<string[]> {
  const sources = await loadUsageSources();
  const all = sources.map((s) => s.text).join("\n");
  return urls.filter((url) => !all.includes(fileKey(url)));
}

/** Elimina definitivamente un file dal bucket "media". Irreversibile. */
export async function deleteMediaFile(
  name: string,
): Promise<{ error: string | null }> {
  const supabase = await createAdminClient();
  const { error } = await supabase.storage.from("media").remove([name]);

  if (error) return { error: friendlyDbError(error) };

  revalidatePath("/admin/media");
  return { error: null };
}

import { createPublicClient } from "@/lib/supabase/publicClient";
import { withRetry } from "@/lib/withRetry";
import type { PageSeo, SiteSettings } from "@/lib/types";

// Lettura pubblica in entrambi i casi: site_settings e page_seo sono
// leggibili da chiunque per policy RLS (servono a homepage/metadati), la
// scrittura invece resta protetta e passa dalle Server Action autenticate.
//
// "*" invece di un elenco di colonne esplicito: se in futuro si aggiunge una
// colonna con una migrazione (come "contact_phone"), il sito non deve
// rompersi nella finestra di tempo tra il deploy del codice e l'esecuzione
// della migrazione sul database — un nome di colonna che non esiste ancora
// nella select esplicita farebbe fallire la query con un errore.

export async function getSiteSettings(): Promise<SiteSettings> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("id", "main")
      .single();

    if (error) throw error;
    return { contact_phone: "", ...data };
  });
}

export async function getPageSeo(
  pageKey: PageSeo["page_key"],
): Promise<PageSeo | null> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("page_seo")
      .select("page_key, seo_title, seo_description, seo_og_image, seo_noindex")
      .eq("page_key", pageKey)
      .maybeSingle();

    if (error) throw error;
    return data;
  });
}

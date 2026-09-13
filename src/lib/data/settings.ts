import { createPublicClient } from "@/lib/supabase/publicClient";
import { withRetry } from "@/lib/withRetry";
import type { PageSeo, SiteSettings } from "@/lib/types";

const SITE_SETTINGS_COLUMNS =
  "site_title, favicon, social_links, ga4_measurement_id, google_site_verification_code, contact_email, accent_color, home_content";

// Lettura pubblica in entrambi i casi: site_settings e page_seo sono
// leggibili da chiunque per policy RLS (servono a homepage/metadati), la
// scrittura invece resta protetta e passa dalle Server Action autenticate.

export async function getSiteSettings(): Promise<SiteSettings> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select(SITE_SETTINGS_COLUMNS)
      .eq("id", "main")
      .single();

    if (error) throw error;
    return data;
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

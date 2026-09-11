import { createClient } from "@/lib/supabase/server";
import type { PageSeo, SiteSettings } from "@/lib/types";

const SITE_SETTINGS_COLUMNS =
  "site_title, favicon, social_links, ga4_measurement_id, google_site_verification_code, contact_email, accent_color, home_content";

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select(SITE_SETTINGS_COLUMNS)
    .eq("id", "main")
    .single();

  if (error) throw error;
  return data;
}

export async function getPageSeo(
  pageKey: PageSeo["page_key"],
): Promise<PageSeo | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("page_seo")
    .select("page_key, seo_title, seo_description, seo_og_image, seo_noindex")
    .eq("page_key", pageKey)
    .maybeSingle();

  if (error) throw error;
  return data;
}

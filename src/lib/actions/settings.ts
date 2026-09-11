"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { HomeContent, PageSeo, ServiceItem } from "@/lib/types";

type FormState = { error: string | null; success?: boolean };

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const HOME_CONTENT_TEXT_FIELDS: Array<Exclude<keyof HomeContent, "services">> =
  [
    "hero_title_main",
    "hero_title_accent",
    "hero_subtitle",
    "hero_quote",
    "cta_primary",
    "cta_secondary",
    "services_title",
  ];

export async function updateSiteSettings(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const socialLinks: Record<string, string> = {};
  for (const key of ["instagram", "linkedin", "dribbble"]) {
    const value = String(formData.get(`social_${key}`) || "").trim();
    if (value) socialLinks[key] = value;
  }

  const accentColor = String(formData.get("accent_color") || "").trim();
  if (!HEX_COLOR_REGEX.test(accentColor)) {
    return { error: "Il colore deve essere un esadecimale tipo #a78bfa." };
  }

  const homeContent = {} as HomeContent;
  for (const field of HOME_CONTENT_TEXT_FIELDS) {
    homeContent[field] = String(formData.get(field) || "").trim();
  }

  let services: ServiceItem[] = [];
  try {
    services = JSON.parse(String(formData.get("services") || "[]"));
  } catch {
    services = [];
  }
  homeContent.services = services.filter((s) => s.title.trim());

  const payload = {
    site_title: String(formData.get("site_title") || "").trim(),
    contact_email: String(formData.get("contact_email") || "").trim(),
    social_links: socialLinks,
    accent_color: accentColor,
    home_content: homeContent,
    ga4_measurement_id:
      String(formData.get("ga4_measurement_id") || "").trim() || null,
    google_site_verification_code:
      String(formData.get("google_site_verification_code") || "").trim() ||
      null,
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", "main");

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  return { error: null, success: true };
}

export async function updatePageSeo(
  pageKey: PageSeo["page_key"],
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const payload = {
    seo_title: String(formData.get("seo_title") || "").trim(),
    seo_description: String(formData.get("seo_description") || "").trim(),
    seo_og_image: String(formData.get("seo_og_image") || "").trim() || null,
    seo_noindex: formData.get("seo_noindex") === "on",
  };

  const supabase = await createClient();
  const { error } = await supabase
    .from("page_seo")
    .upsert({ page_key: pageKey, ...payload });

  if (error) return { error: error.message };

  revalidatePath("/");
  return { error: null, success: true };
}

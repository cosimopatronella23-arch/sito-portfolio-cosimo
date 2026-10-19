"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import {
  DEFAULT_SECTION_THEMES,
  THEME_LABELS,
} from "@/lib/homeDefaults";
import type {
  HomeContent,
  HomeSectionKey,
  ProcessStep,
  SectionTheme,
  HomepageBlock,
  NavLink,
  PageSeo,
  ServiceItem,
} from "@/lib/types";

type FormState = { error: string | null; success?: boolean };

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

const HOME_CONTENT_TEXT_FIELDS: Array<
  Exclude<
    keyof HomeContent,
    | "services"
    | "show_services"
    | "show_projects"
    | "show_blog_preview"
    | "show_contact"
    | "nav_links"
    | "blocks"
    | "reviews"
    | "process_steps"
    | "show_process"
    | "show_reviews"
    | "section_style"
  >
> = [
  "hero_title_accent",
  "hero_subtitle",
  "hero_quote",
  "cta_primary",
  "cta_secondary",
  "services_title",
  "services_intro",
  "hero_eyebrow",
  "projects_title",
  "process_title",
  "process_subtitle",
  "contact_eyebrow",
  "contact_title",
  "contact_text",
  "footer_tagline",
  "vat_number",
  "background_color",
  "foreground_color",
];

export async function updateSiteSettings(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const socialLinks: Record<string, string> = {};
  for (const key of ["instagram", "linkedin", "dribbble", "google"]) {
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

  // Trim solo iniziale: un "a capo" finale è intenzionale (spinge il titolo
  // accentato sulla riga successiva) e non va tolto come farebbe .trim().
  homeContent.hero_title_main = String(
    formData.get("hero_title_main") || "",
  ).replace(/^\s+/, "");

  // Sfondo/testo: vuoti = usa i default del sito, altrimenti devono essere
  // esadecimali validi (stessa regola dell'accento).
  for (const field of ["background_color", "foreground_color"] as const) {
    const value = homeContent[field];
    if (value && !HEX_COLOR_REGEX.test(value)) {
      return {
        error: "I colori devono essere esadecimali tipo #0b0a10, oppure vuoti.",
      };
    }
  }

  // Partita IVA: solo le 11 cifre, senza spazi né "IT" davanti.
  homeContent.vat_number = (homeContent.vat_number ?? "")
    .replace(/\s+/g, "")
    .replace(/^IT/i, "");
  if (homeContent.vat_number && !/^\d{11}$/.test(homeContent.vat_number)) {
    return { error: "La partita IVA deve avere 11 cifre, es. 01234567890." };
  }

  let services: ServiceItem[] = [];
  try {
    services = JSON.parse(String(formData.get("services") || "[]"));
  } catch {
    services = [];
  }
  homeContent.services = services
    .filter((s) => s.title.trim())
    .map(({ title, description, href }) => ({
      title,
      description,
      ...(href?.trim() ? { href: href.trim() } : {}),
    }));
  homeContent.show_services = formData.get("show_services") === "on";
  homeContent.show_projects = formData.get("show_projects") === "on";
  homeContent.show_blog_preview = formData.get("show_blog_preview") === "on";
  homeContent.show_contact = formData.get("show_contact") === "on";

  let navLinks: NavLink[] = [];
  try {
    navLinks = JSON.parse(String(formData.get("nav_links") || "[]"));
  } catch {
    navLinks = [];
  }
  homeContent.nav_links = navLinks.filter(
    (link) => link.label.trim() && link.href.trim(),
  );

  let blocks: HomepageBlock[] = [];
  try {
    blocks = JSON.parse(String(formData.get("blocks") || "[]"));
  } catch {
    blocks = [];
  }
  homeContent.blocks = blocks.filter((b) => b.id && b.type);

  // Design "Dumbar": secondo colore, sezione "Come lavoro", tema di ogni
  // sezione. Vuoti = valori predefiniti (src/lib/homeDefaults.ts).
  homeContent.show_process = formData.get("show_process") === "on";
  homeContent.show_reviews = formData.get("show_reviews") === "on";

  let processSteps: ProcessStep[] = [];
  try {
    processSteps = JSON.parse(String(formData.get("process_steps") || "[]"));
  } catch {
    processSteps = [];
  }
  homeContent.process_steps = processSteps
    .filter((step) => step.title?.trim())
    .map((step) => ({
      title: String(step.title).trim().slice(0, 80),
      text: String(step.text ?? "").trim().slice(0, 400),
      badge: String(step.badge ?? "").trim().slice(0, 30),
    }))
    .slice(0, 6);

  const themes: Partial<Record<HomeSectionKey, SectionTheme>> = {};
  for (const key of Object.keys(DEFAULT_SECTION_THEMES) as HomeSectionKey[]) {
    const value = String(formData.get(`section_theme_${key}`) || "");
    if (value in THEME_LABELS) themes[key] = value as SectionTheme;
  }
  homeContent.section_style = themes;

  const payload = {
    site_title: String(formData.get("site_title") || "").trim(),
    contact_email: String(formData.get("contact_email") || "").trim(),
    contact_phone: String(formData.get("contact_phone") || "").trim(),
    social_links: socialLinks,
    accent_color: accentColor,
    home_content: homeContent,
    ga4_measurement_id:
      String(formData.get("ga4_measurement_id") || "").trim() || null,
    google_site_verification_code:
      String(formData.get("google_site_verification_code") || "").trim() ||
      null,
  };

  const supabase = await createAdminClient();

  // Le recensioni si gestiscono in /admin/recensioni, non in questo modulo:
  // vanno conservate così come sono, altrimenti questo salvataggio (che
  // riscrive i contenuti della homepage) le cancellerebbe.
  const { data: current } = await supabase
    .from("site_settings")
    .select("home_content")
    .eq("id", "main")
    .maybeSingle();
  const currentReviews = (current?.home_content as HomeContent | undefined)
    ?.reviews;
  if (currentReviews) homeContent.reviews = currentReviews;
  // Colori per sezione del vecchio design: non più modificabili qui, ma si
  // conservano così come sono.
  const currentSectionColors = (current?.home_content as HomeContent | undefined)
    ?.section_colors;
  if (currentSectionColors) homeContent.section_colors = currentSectionColors;

  let { error } = await supabase
    .from("site_settings")
    .update(payload)
    .eq("id", "main");

  // "contact_phone" esiste nel codice da subito, ma sul database compare
  // solo dopo aver eseguito la migrazione 0005 in Supabase Studio. Nella
  // finestra di tempo prima che tu la esegua, il salvataggio non deve
  // rompersi per gli altri campi: se l'errore è proprio "colonna non
  // trovata", si ritenta senza il numero di telefono.
  const isMissingPhoneColumn =
    error &&
    (error.code === "PGRST204" || error.code === "42703") &&
    error.message.includes("contact_phone");
  if (isMissingPhoneColumn) {
    const { contact_phone: _contactPhone, ...withoutPhone } = payload;
    ({ error } = await supabase
      .from("site_settings")
      .update(withoutPhone)
      .eq("id", "main"));
  }

  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/impostazioni");
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

  const supabase = await createAdminClient();
  const { error } = await supabase
    .from("page_seo")
    .upsert({ page_key: pageKey, ...payload });

  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/impostazioni");
  return { error: null, success: true };
}

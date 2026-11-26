import { THEME_LABELS } from "@/lib/homeDefaults";
import { cleanSectionOrder } from "@/lib/homeLayout";
import type {
  HeroSlide,
  HomeContent,
  HomeSectionKey,
  HomepageBlock,
  NavLink,
  ProcessStep,
  SectionTheme,
  ServiceItem,
} from "@/lib/types";

/**
 * Applica i campi di un modulo delle impostazioni, gruppo per gruppo, ai
 * contenuti attuali. Si usa sia per salvare (src/lib/actions/siteSettings)
 * sia per l'anteprima dal vivo della homepage: così l'anteprima mostra
 * esattamente quello che il salvataggio scriverebbe.
 */

const HEX = /^#[0-9a-fA-F]{6}$/;
export const GROUPS = [
  "general",
  "contacts",
  "google",
  "colors",
  "menu",
  "services-page",
  "home-layout",
  "home-hero",
  "home-marquee",
  "home-projects",
  "home-services",
  "home-process",
  "home-reviews",
  "home-blog",
  "home-contact",
  "home-blocks",
] as const;
type Group = (typeof GROUPS)[number];

/** Gruppo della homepage -> sezione di cui salva lo sfondo. */
const THEME_OF: Partial<Record<Group, HomeSectionKey>> = {
  "home-hero": "hero",
  "home-marquee": "marquee",
  "home-projects": "projects",
  "home-services": "services",
  "home-process": "process",
  "home-reviews": "reviews",
  "home-blog": "blog",
  "home-contact": "contact",
};

const str = (fd: FormData, key: string, max = 2000) =>
  String(fd.get(key) ?? "").trim().slice(0, max);

function json<T>(fd: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(String(fd.get(key) || "")) as T;
  } catch {
    return fallback;
  }
}

export function applySettingsGroups(
  currentHome: HomeContent,
  groupsRaw: string,
  fd: FormData,
): { home: HomeContent; columns: Record<string, unknown> } | { error: string } {
  const groups = groupsRaw
    .split(",")
    .filter((g): g is Group => (GROUPS as readonly string[]).includes(g));
  if (groups.length === 0) return { error: "Niente da salvare." };

  const home: HomeContent = { ...currentHome };
  const columns: Record<string, unknown> = {};

  for (const group of groups) {
    switch (group) {
      case "general": {
        columns.site_title = str(fd, "site_title", 200);
        const vat = str(fd, "vat_number", 20).replace(/\s+/g, "").replace(/^IT/i, "");
        if (vat && !/^\d{11}$/.test(vat)) {
          return { error: "La partita IVA deve avere 11 cifre, es. 01234567890." };
        }
        home.vat_number = vat;
        break;
      }
      case "contacts": {
        columns.contact_email = str(fd, "contact_email", 254);
        columns.contact_phone = str(fd, "contact_phone", 40);
        const social: Record<string, string> = {};
        for (const key of ["instagram", "linkedin", "dribbble", "google"]) {
          const value = str(fd, `social_${key}`, 500);
          if (value) social[key] = value;
        }
        columns.social_links = social;
        break;
      }
      case "google": {
        const ga = str(fd, "ga4_measurement_id", 40);
        if (ga && !/^G-[A-Z0-9]+$/.test(ga)) {
          return { error: "Il codice di Google Analytics inizia con G-, es. G-AB12CD34EF." };
        }
        columns.ga4_measurement_id = ga || null;
        columns.google_site_verification_code =
          str(fd, "google_site_verification_code", 200) || null;
        break;
      }
      case "colors": {
        const accent = str(fd, "accent_color", 7);
        if (!HEX.test(accent)) {
          return { error: "Il colore accento deve essere tipo #a78bfa." };
        }
        columns.accent_color = accent;
        for (const key of ["background_color", "foreground_color"] as const) {
          const value = str(fd, key, 7);
          if (value && !HEX.test(value)) {
            return { error: "I colori devono essere tipo #0b0a10, oppure vuoti." };
          }
          home[key] = value;
        }
        break;
      }
      case "menu": {
        home.nav_links = json<NavLink[]>(fd, "nav_links", [])
          .filter((l) => l?.label?.trim() && l?.href?.trim())
          .map((l) => ({ label: l.label.trim().slice(0, 60), href: l.href.trim().slice(0, 300) }))
          .slice(0, 12);
        home.footer_tagline = str(fd, "footer_tagline", 400);
        break;
      }
      case "services-page": {
        home.services_title = str(fd, "services_title", 200);
        home.services_intro = str(fd, "services_intro", 1500);
        break;
      }
      case "home-layout": {
        home.section_order = cleanSectionOrder(json<string[]>(fd, "section_order", []));
        for (const key of [
          "show_marquee",
          "show_projects",
          "show_services",
          "show_process",
          "show_reviews",
          "show_blog_preview",
          "show_contact",
        ] as const) {
          if (fd.has(key)) home[key] = fd.get(key) === "on";
        }
        break;
      }
      case "home-hero": {
        // Solo l'inizio si ripulisce: un "a capo" finale è voluto.
        home.hero_title_main = String(fd.get("hero_title_main") ?? "")
          .replace(/^\s+/, "")
          .slice(0, 300);
        home.hero_title_accent = str(fd, "hero_title_accent", 200);
        home.cta_primary = str(fd, "cta_primary", 80);
        home.hero_eyebrow = str(fd, "hero_eyebrow", 200);
        home.hero_subtitle = str(fd, "hero_subtitle", 600);
        home.hero_slides = json<HeroSlide[]>(fd, "hero_slides", [])
          .map((s) => ({
            project: String(s?.project ?? "").trim().slice(0, 120),
            cover: String(s?.cover ?? "").trim().slice(0, 500),
          }))
          .filter((s) => s.project && /^https?:\/\//.test(s.cover))
          .slice(0, 12);
        break;
      }
      case "home-marquee":
        break;
      case "home-projects":
        home.projects_title = str(fd, "projects_title", 200);
        break;
      case "home-services": {
        home.services_title = str(fd, "services_title", 200);
        home.services = json<ServiceItem[]>(fd, "services", [])
          .filter((s) => s?.title?.trim())
          .map(({ title, description, href }) => ({
            title: title.trim().slice(0, 120),
            description: String(description ?? "").trim().slice(0, 600),
            ...(href?.trim() ? { href: href.trim().slice(0, 300) } : {}),
          }))
          .slice(0, 12);
        break;
      }
      case "home-process": {
        home.process_title = str(fd, "process_title", 200);
        home.process_subtitle = str(fd, "process_subtitle", 400);
        home.process_steps = json<ProcessStep[]>(fd, "process_steps", [])
          .filter((step) => step?.title?.trim())
          .map((step) => ({
            title: String(step.title).trim().slice(0, 80),
            text: String(step.text ?? "").trim().slice(0, 400),
            badge: String(step.badge ?? "").trim().slice(0, 30),
          }))
          .slice(0, 6);
        break;
      }
      case "home-reviews":
      case "home-blog":
        break;
      case "home-contact":
        home.contact_eyebrow = str(fd, "contact_eyebrow", 120);
        home.contact_title = str(fd, "contact_title", 200);
        home.contact_text = str(fd, "contact_text", 600);
        break;
      case "home-blocks":
        home.blocks = json<HomepageBlock[]>(fd, "blocks", []).filter((b) => b?.id && b?.type);
        break;
    }

    // Sfondo della sezione, se il gruppo ne ha uno e il modulo lo manda.
    const sectionKey = THEME_OF[group];
    if (sectionKey && fd.has("section_theme")) {
      const value = String(fd.get("section_theme"));
      if (value in THEME_LABELS) {
        home.section_style = {
          ...(home.section_style ?? {}),
          [sectionKey]: value as SectionTheme,
        };
      }
    }
  }

  return { home, columns };
}

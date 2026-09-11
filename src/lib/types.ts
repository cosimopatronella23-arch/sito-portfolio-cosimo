/**
 * Tipi allineati 1:1 allo schema Supabase descritto nel prompt di progetto.
 * In Fase 2 questi tipi verranno generati/validati dalle tabelle reali; per ora
 * sono la "fonte di verità" usata sia dai dati mock che dai componenti, così lo
 * swap mock -> query Supabase non richiederà modifiche ai componenti.
 */

export type ContentStatus = "draft" | "published";

export interface ContentBlock {
  heading: string;
  body: string;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  category: string;
  client: string;
  year: number;
  cover_image: string | null;
  gallery: string[];
  short_description: string;
  content_blocks: ContentBlock[];
  external_link: string | null;
  featured: boolean;
  status: ContentStatus;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  seo_noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  category: string;
  cover_image: string | null;
  excerpt: string;
  content: string;
  status: ContentStatus;
  published_at: string;
  seo_title: string | null;
  seo_description: string | null;
  seo_og_image: string | null;
  seo_noindex: boolean;
  created_at: string;
  updated_at: string;
}

export interface ServiceItem {
  title: string;
  description: string;
}

export interface HomeContent {
  hero_title_main: string;
  hero_title_accent: string;
  hero_subtitle: string;
  hero_quote: string;
  cta_primary: string;
  cta_secondary: string;
  services_title: string;
  services: ServiceItem[];
}

export interface SiteSettings {
  site_title: string;
  favicon: string | null;
  social_links: Record<string, string>;
  ga4_measurement_id: string | null;
  google_site_verification_code: string | null;
  contact_email: string;
  accent_color: string;
  home_content: HomeContent;
}

export interface PageSeo {
  page_key: "home" | "servizi" | "contatti";
  seo_title: string;
  seo_description: string;
  seo_og_image: string | null;
  seo_noindex: boolean;
}

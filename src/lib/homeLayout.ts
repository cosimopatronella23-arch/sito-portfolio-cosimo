import type { HomeContent, HomeOrderKey } from "@/lib/types";

/** Ordine predefinito delle sezioni dopo l'apertura: quello storico. */
export const HOME_ORDERABLE: readonly HomeOrderKey[] = [
  "marquee",
  "projects",
  "services",
  "process",
  "reviews",
  "blog",
  "blocks",
  "contact",
];

/** Tiene solo chiavi valide, senza doppioni, e aggiunge in coda quelle
 *  mancanti (una sezione nuova non sparisce mai dall'elenco). */
export function cleanSectionOrder(raw: readonly string[] | undefined): HomeOrderKey[] {
  const seen = new Set<HomeOrderKey>();
  for (const key of raw ?? []) {
    if ((HOME_ORDERABLE as readonly string[]).includes(key)) seen.add(key as HomeOrderKey);
  }
  for (const key of HOME_ORDERABLE) seen.add(key);
  return [...seen];
}

export function sectionOrder(content: HomeContent): HomeOrderKey[] {
  return cleanSectionOrder(content.section_order);
}

/** Campo che accende o spegne ogni sezione (le aggiunte a mano no). */
export const VISIBILITY_FIELD: Partial<Record<HomeOrderKey, keyof HomeContent>> = {
  marquee: "show_marquee",
  projects: "show_projects",
  services: "show_services",
  process: "show_process",
  reviews: "show_reviews",
  blog: "show_blog_preview",
  contact: "show_contact",
};

export function isSectionVisible(content: HomeContent, key: HomeOrderKey): boolean {
  const field = VISIBILITY_FIELD[key];
  return field ? (content[field] as boolean | undefined) ?? true : true;
}

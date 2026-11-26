import type { HomeOrderKey } from "@/lib/types";

/** Sezioni della homepage nell'admin: indirizzo, nome, gruppo di salvataggio
 *  e ancora nell'anteprima. */
export const HOME_SECTIONS_ADMIN: Record<
  "apertura" | HomeOrderKeySlug,
  { key: "hero" | HomeOrderKey; title: string; group: string }
> = {
  apertura: { key: "hero", title: "Apertura", group: "home-hero" },
  banda: { key: "marquee", title: "Banda che scorre", group: "home-marquee" },
  progetti: { key: "projects", title: "Progetti", group: "home-projects" },
  servizi: { key: "services", title: "Servizi", group: "home-services" },
  "come-lavoro": { key: "process", title: "Come lavoro", group: "home-process" },
  recensioni: { key: "reviews", title: "Recensioni", group: "home-reviews" },
  blog: { key: "blog", title: "Dal blog", group: "home-blog" },
  "sezioni-aggiunte": { key: "blocks", title: "Sezioni aggiunte", group: "home-blocks" },
  contatti: { key: "contact", title: "Contatti", group: "home-contact" },
};

type HomeOrderKeySlug =
  | "banda"
  | "progetti"
  | "servizi"
  | "come-lavoro"
  | "recensioni"
  | "blog"
  | "sezioni-aggiunte"
  | "contatti";

export type HomeSectionSlug = keyof typeof HOME_SECTIONS_ADMIN;

export function slugOfSection(key: "hero" | HomeOrderKey): HomeSectionSlug {
  return (Object.keys(HOME_SECTIONS_ADMIN) as HomeSectionSlug[]).find(
    (slug) => HOME_SECTIONS_ADMIN[slug].key === key,
  ) as HomeSectionSlug;
}

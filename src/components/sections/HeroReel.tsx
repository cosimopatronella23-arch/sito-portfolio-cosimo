import { getPublishedProjects } from "@/lib/data/projects";
import type { HeroSlide } from "@/lib/types";

export type ReelItem = {
  slug: string;
  title: string;
  category: string;
  cover: string;
  /** true se la copertina è verticale 1:2 (scelta in Impostazioni). */
  portrait: boolean;
};

const MAX_ITEMS = 12;

/**
 * Copertine dello slider dei lavori nell'hero. Se in Impostazioni ci sono
 * copertine verticali scelte a mano, si usano quelle (solo per progetti
 * pubblicati, nell'ordine scelto); altrimenti le copertine dei progetti.
 * Con meno di tre elementi lo slider non compare.
 */
export async function getReelItems(slides?: HeroSlide[]): Promise<ReelItem[]> {
  const projects = await getPublishedProjects();
  const bySlug = new Map(projects.map((p) => [p.slug, p]));

  const chosen: ReelItem[] = (slides ?? []).flatMap((s) => {
    const p = bySlug.get(s.project);
    return p && s.cover
      ? [{ slug: p.slug, title: p.title, category: p.category, cover: s.cover, portrait: true }]
      : [];
  });
  if (chosen.length >= 3) return chosen.slice(0, MAX_ITEMS);

  const fallback = projects.filter((p) => p.cover_image);
  if (fallback.length < 3) return [];
  return fallback.slice(0, 9).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    cover: p.cover_image as string,
    portrait: false,
  }));
}

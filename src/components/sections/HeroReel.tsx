import { getPublishedProjects } from "@/lib/data/projects";

export type ReelItem = {
  slug: string;
  title: string;
  category: string;
  cover: string;
};

const MAX_ITEMS = 9;

/**
 * Copertine dei progetti pubblicati per il montaggio dell'hero (al massimo
 * nove, nell'ordine scelto in /admin). Con meno di tre progetti il
 * montaggio non compare e l'hero resta solo titolo.
 */
export async function getReelItems(): Promise<ReelItem[]> {
  const projects = (await getPublishedProjects()).filter((p) => p.cover_image);
  if (projects.length < 3) return [];
  return projects.slice(0, MAX_ITEMS).map((p) => ({
    slug: p.slug,
    title: p.title,
    category: p.category,
    cover: p.cover_image as string,
  }));
}

import { createPublicClient } from "@/lib/supabase/publicClient";
import { createClient } from "@/lib/supabase/server";
import { withRetry } from "@/lib/withRetry";
import type { GalleryItem, Project } from "@/lib/types";

/**
 * La colonna "gallery" è passata da un elenco di link (testo) a un elenco
 * di oggetti {url, layout}. Finché la migrazione non è stata eseguita sul
 * database, Supabase restituisce ancora il formato vecchio: questa funzione
 * capisce entrambi, così il sito non si rompe in nessuno dei due casi.
 */
function normalizeGallery(raw: unknown): GalleryItem[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item): GalleryItem | null => {
      if (typeof item === "string") {
        return item ? { url: item, layout: "full" } : null;
      }
      if (item && typeof item === "object" && "url" in item) {
        const url = String((item as { url: unknown }).url || "");
        if (!url) return null;
        const layout =
          (item as { layout?: unknown }).layout === "half" ? "half" : "full";
        return { url, layout };
      }
      return null;
    })
    .filter((item): item is GalleryItem => item !== null);
}

function normalizeProject<T extends { gallery: unknown } | null>(
  project: T,
): T {
  if (!project) return project;
  return { ...project, gallery: normalizeGallery(project.gallery) };
}

export async function getPublishedProjects(): Promise<Project[]> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published");

    if (error) throw error;
    return (data ?? []).map(normalizeProject);
  });
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return normalizeProject(data);
  });
}

/** Per /admin: vede anche le bozze, richiede la sessione dell'utente loggato. */
export async function getAllProjectsAdmin(): Promise<Project[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeProject);
}

export async function getProjectByIdAdmin(id: string): Promise<Project | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return normalizeProject(data);
}

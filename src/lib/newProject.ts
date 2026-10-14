import type { Project } from "@/lib/types";

/** "Nuovo": solo il progetto creato più di recente, se ha meno di 60 giorni. */
export function newestRecentProjectId(projects: Project[]): string | null {
  const newest = [...projects].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
  if (!newest) return null;
  const days = (Date.now() - new Date(newest.created_at).getTime()) / 864e5;
  return days < 60 ? newest.id : null;
}

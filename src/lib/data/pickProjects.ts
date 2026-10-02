import type { Project } from "@/lib/types";

/** I progetti indicati, nell'ordine scelto, ignorando quelli non pubblicati. */
export function pickProjects(projects: Project[], slugs: string[]): Project[] {
  return slugs
    .map((slug) => projects.find((p) => p.slug === slug))
    .filter((p): p is Project => !!p);
}

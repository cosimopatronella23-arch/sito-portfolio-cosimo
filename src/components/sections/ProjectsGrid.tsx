import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkGrid } from "@/components/project/WorkGrid";
import { getPublishedProjects } from "@/lib/data/projects";
import type { SectionTheme } from "@/lib/types";

// Solo i progetti "in evidenza" (massimo 4) in homepage: l'elenco completo
// vive in /progetti.
const HOMEPAGE_LIMIT = 4;

export async function ProjectsGrid({ theme }: { theme: SectionTheme }) {
  const published = await getPublishedProjects();
  const featured = published.filter((p) => p.featured).slice(0, HOMEPAGE_LIMIT);
  if (featured.length === 0) return null;
  const others = published.length - featured.length;

  return (
    <section id="progetti" className={`theme-${theme} container-px py-24 sm:py-32`}>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12 sm:pb-16">
        <SectionHeading title="Lavori scelti." size="poster" />
        <span className="font-display text-base font-semibold text-foreground-muted">
          {String(published.length).padStart(2, "0")} progetti
        </span>
      </div>

      <WorkGrid projects={featured} />

      <Link
        href="/progetti"
        data-cursor="link"
        className="group mt-14 flex items-center justify-between gap-6 border-t border-border-strong pt-7"
      >
        <span className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
          <span className="link-draw">
            {others > 0 ? `Tutti i progetti, altri ${others}` : "Tutti i progetti"}
          </span>
        </span>
        <span
          aria-hidden="true"
          className="flex size-14 items-center justify-center bg-foreground text-xl text-background transition-[background-color,color] duration-300 group-hover:bg-fill group-hover:text-ink"
        >
          <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
        </span>
      </Link>
    </section>
  );
}

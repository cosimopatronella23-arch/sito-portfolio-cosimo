import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectScreen } from "@/components/project/ProjectScreen";
import { getPublishedProjects } from "@/lib/data/projects";
import { newestRecentProjectId } from "@/lib/newProject";
import type { SectionTheme } from "@/lib/types";

// Solo i progetti "in evidenza" (massimo 5) in homepage: l'elenco completo
// vive in /progetti.
const HOMEPAGE_LIMIT = 5;

/**
 * Progetti in homepage: ogni progetto a tutto schermo, che scorrendo si
 * impila sul precedente. Titolo e link finale stanno nel tema della sezione.
 */
export async function ProjectsGrid({
  title,
  theme,
}: {
  title: string;
  theme: SectionTheme;
}) {
  const published = await getPublishedProjects();
  const featured = published.filter((p) => p.featured).slice(0, HOMEPAGE_LIMIT);
  if (featured.length === 0) return null;
  const others = published.length - featured.length;

  const newestId = newestRecentProjectId(published);

  return (
    <section id="progetti" className={`theme-${theme}`}>
      <div className="container-px pt-24 pb-12 sm:pt-32 sm:pb-16">
        <SectionHeading title={title} size="poster" />
      </div>

      <div className="flex flex-col">
        {featured.map((project, i) => (
          <ProjectScreen
            key={project.id}
            project={project}
            index={i}
            total={featured.length}
            isNew={project.id === newestId}
          />
        ))}
      </div>

      <div className="container-px py-14 sm:py-16">
        <Link
          href="/progetti"
          data-cursor="link"
          data-hide-whatsapp
          className="group flex items-center justify-between gap-6 border-t border-border-strong pt-7"
        >
          <span className="font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
            <span className="link-draw">
              {others > 0 ? `Vedi tutti i ${published.length} progetti` : "Tutti i progetti"}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center bg-foreground text-xl text-background transition-[background-color,color] duration-300 group-hover:bg-fill group-hover:text-ink"
          >
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </Link>
      </div>
    </section>
  );
}

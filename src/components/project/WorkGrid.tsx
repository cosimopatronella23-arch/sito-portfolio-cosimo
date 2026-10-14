import Link from "next/link";
import clsx from "clsx";
import { CoverImage } from "@/components/ui/CoverImage";
import type { Project } from "@/lib/types";
import { newestRecentProjectId } from "@/lib/newProject";

// Ritmo asimmetrico che si ripete ogni 4 progetti: grande/piccolo,
// piccolo/grande. Su telefono un progetto per riga.
const PATTERN = [
  { span: "lg:col-span-8", h: "aspect-[4/3] lg:aspect-auto lg:h-[min(42vw,600px)]" },
  { span: "lg:col-span-4", h: "aspect-[4/3] lg:aspect-auto lg:h-[min(42vw,600px)]" },
  { span: "lg:col-span-4", h: "aspect-[4/3] lg:aspect-auto lg:h-[min(36vw,520px)]" },
  { span: "lg:col-span-8", h: "aspect-[4/3] lg:aspect-auto lg:h-[min(36vw,520px)]" },
];


/**
 * Griglia dei progetti (homepage e /progetti). Foto a colori; al passaggio
 * del mouse l'immagine si avvicina, una fascia colorata sale dal basso e il
 * titolo si sottolinea.
 */
export function WorkGrid({
  projects,
  priority = false,
  headingLevel = "h3",
}: {
  projects: Project[];
  priority?: boolean;
  /** "h2" quando la griglia è il contenuto principale della pagina. */
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  const newId = newestRecentProjectId(projects);
  return (
    <div className="grid grid-cols-1 gap-x-6 gap-y-12 lg:grid-cols-12 lg:gap-y-14">
      {projects.map((project, i) => {
        const p = PATTERN[i % PATTERN.length];
        return (
          <article key={project.id} className={clsx("min-w-0", p.span)}>
            <Link
              href={`/progetti/${project.slug}`}
              data-cursor="link"
              className="group flex flex-col"
            >
              <div className={clsx("relative overflow-hidden bg-surface", p.h)}>
                <CoverImage
                  src={project.cover_image}
                  alt={project.title}
                  index={i}
                  priority={priority && i < 2}
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
                {project.id === newId ? (
                  <span className="absolute top-4 left-4 bg-accent px-3 py-1.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                    Nuovo
                  </span>
                ) : null}
                <span className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between bg-fill px-5 py-4 text-sm font-semibold tracking-[0.08em] text-ink uppercase transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-focus-visible:translate-y-0">
                  Vedi il progetto
                  <span aria-hidden="true">→</span>
                </span>
              </div>
              <div className="mt-4 grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-t-2 border-foreground pt-4">
                <span className="font-display text-sm font-semibold tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Heading className="font-display text-2xl leading-none font-bold tracking-[-0.03em] sm:text-3xl">
                  <span className="link-draw">{project.title}</span>
                </Heading>
                <span className="text-right text-xs tracking-[0.1em] text-foreground-muted uppercase">
                  {project.category}
                  {project.year ? ` · ${project.year}` : ""}
                </span>
              </div>
            </Link>
          </article>
        );
      })}
    </div>
  );
}

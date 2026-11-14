import Link from "next/link";
import { CoverImage } from "@/components/ui/CoverImage";
import type { Project } from "@/lib/types";

/**
 * Fascia in fondo alla pagina progetto: porta al progetto successivo
 * nell'ordine scelto in admin (dall'ultimo si torna al primo), così chi ha
 * appena visto un lavoro può continuare a guardare senza tornare indietro.
 * Stesso movimento delle card dei progetti: l'immagine si avvicina e il
 * titolo si sottolinea al passaggio del mouse.
 */
export function NextProject({ project }: { project: Project }) {
  return (
    <section
      aria-label="Prossimo progetto"
      className="theme-ink container-px py-16 sm:py-24"
    >
      <Link
        href={`/progetti/${project.slug}`}
        data-cursor="link"
        className="group grid grid-cols-1 items-end gap-8 lg:grid-cols-12 lg:gap-10"
      >
        <div className="flex flex-col gap-5 lg:col-span-5">
          <p className="text-xs font-semibold tracking-[0.12em] text-foreground-muted uppercase">
            Prossimo progetto
          </p>
          <h2 className="font-display text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95] font-bold tracking-[-0.045em] text-balance">
            <span className="link-draw">{project.title}</span>
          </h2>
          <p className="flex items-center gap-3 border-t-2 border-foreground pt-4 text-xs tracking-[0.1em] text-foreground-muted uppercase">
            <span className="flex-1">
              {project.category}
              {project.year ? ` · ${project.year}` : ""}
            </span>
            <span
              aria-hidden="true"
              className="font-display text-2xl text-foreground transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2"
            >
              →
            </span>
          </p>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden bg-surface lg:col-span-7">
          <CoverImage
            src={project.cover_image}
            alt=""
            index={0}
            sizes="(min-width: 1024px) 58vw, 100vw"
            className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
          />
        </div>
      </Link>
    </section>
  );
}

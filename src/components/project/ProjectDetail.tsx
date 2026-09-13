import Link from "next/link";
import { ProjectMediaGallery } from "./ProjectMediaGallery";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/lib/types";

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <article className="container-px py-20 sm:py-28">
      <div className="flex flex-col gap-10">
        <Link
          href="/#progetti"
          className="w-max text-sm text-foreground-muted hover:text-foreground"
        >
          ← Torna ai progetti
        </Link>

        <header className="flex flex-col gap-5">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-lg text-foreground-muted">
            {project.short_description}
          </p>
          <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-3 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-foreground-muted">Cliente</dt>
              <dd className="font-medium">{project.client}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Anno</dt>
              <dd className="font-medium">{project.year}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Categoria</dt>
              <dd className="font-medium">{project.category}</dd>
            </div>
          </dl>
        </header>

        <ProjectMediaGallery
          images={[project.cover_image, ...project.gallery].filter(
            (src): src is string => Boolean(src),
          )}
          alt={project.title}
        />

        <div className="flex flex-col gap-12">
          {project.content_blocks.map((block) => (
            <section key={block.heading} className="flex flex-col gap-3">
              <h2 className="font-display text-2xl font-semibold">
                {block.heading}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-foreground-muted">
                {block.body}
              </p>
            </section>
          ))}
        </div>

        {project.external_link ? (
          <Button
            href={project.external_link}
            variant="secondary"
            size="lg"
            className="w-max"
          >
            Visita il sito →
          </Button>
        ) : null}
      </div>
    </article>
  );
}

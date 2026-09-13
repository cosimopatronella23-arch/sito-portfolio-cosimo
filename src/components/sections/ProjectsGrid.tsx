import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectScreen } from "@/components/project/ProjectScreen";
import { getPublishedProjects } from "@/lib/data/projects";
import { sectionStyle } from "@/lib/contrast";

// Solo i progetti "in evidenza" appaiono in homepage (max 5): l'elenco
// completo vive nella pagina dedicata /progetti, per non appesantire la
// home man mano che i progetti crescono di numero.
const HOMEPAGE_LIMIT = 5;

function byRecency(a: { created_at: string }, b: { created_at: string }) {
  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
}

export async function ProjectsGrid({
  backgroundColor,
}: {
  backgroundColor?: string;
} = {}) {
  const published = await getPublishedProjects();
  // Solo i progetti con "In evidenza" spuntato in /admin: qualsiasi altro
  // progetto pubblicato resta visibile solo in /progetti, mai qui — nessun
  // ripiego automatico se non ne hai ancora segnato nessuno.
  const ordered = published
    .filter((p) => p.featured)
    .sort(byRecency)
    .slice(0, HOMEPAGE_LIMIT);

  if (ordered.length === 0) return null;

  return (
    <section id="progetti" style={sectionStyle(backgroundColor)} className="relative">
      <div className="container-px flex flex-wrap items-end justify-between gap-6 pt-24 sm:pt-32">
        <SectionHeading title="Qualche progetto di cui vado fiero." />
        {published.length > 0 ? (
          <Link
            href="/progetti"
            data-cursor="link"
            className="text-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:text-accent"
          >
            Tutti i progetti →
          </Link>
        ) : null}
      </div>

      <div className="mt-14 flex flex-col sm:mt-20">
        {ordered.map((project, i) => (
          <ProjectScreen
            key={project.id}
            project={project}
            index={i}
            total={ordered.length}
          />
        ))}
      </div>
    </section>
  );
}

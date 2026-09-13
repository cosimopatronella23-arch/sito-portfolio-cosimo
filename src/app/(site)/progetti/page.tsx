import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProjectScreen } from "@/components/project/ProjectScreen";
import { ProjectPairScreen } from "@/components/project/ProjectPairScreen";
import { buildMetadata } from "@/lib/seo";
import { getPublishedProjects } from "@/lib/data/projects";
import type { Project } from "@/lib/types";

function chunkInPairs(items: Project[]): Project[][] {
  const pairs: Project[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    pairs.push(items.slice(i, i + 2));
  }
  return pairs;
}

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "Progetti",
  description:
    "Tutti i progetti di design e sviluppo firmati Cosimo Patronella.",
  path: "/progetti",
});

export default async function ProjectsIndexPage() {
  const published = await getPublishedProjects();
  const featured = published.filter((p) => p.featured);
  const rest = published
    .filter((p) => !p.featured)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  const ordered = [...featured, ...rest];
  const pairs = chunkInPairs(ordered);

  return (
    <div className="relative">
      <div className="container-px pt-20 sm:pt-28">
        <SectionHeading title="Tutti i progetti." />
      </div>

      {ordered.length === 0 ? (
        <p className="container-px mt-10 text-foreground-muted">
          Nessun progetto pubblicato ancora.
        </p>
      ) : (
        <>
          {/* Mobile: un progetto a schermo, stessa pila della homepage —
              due riquadri affiancati non lascerebbero spazio a un'immagine
              leggibile su schermi stretti. */}
          <div className="mt-14 flex flex-col sm:hidden">
            {ordered.map((project, i) => (
              <ProjectScreen
                key={project.id}
                project={project}
                index={i}
                total={ordered.length}
              />
            ))}
          </div>

          {/* Desktop: coppie affiancate per schermata. */}
          <div className="mt-14 hidden flex-col sm:mt-20 sm:flex">
            {pairs.map((pair, i) => (
              <ProjectPairScreen
                key={pair.map((p) => p.id).join("-")}
                projects={pair}
                index={i}
                total={pairs.length}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

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

export async function generateMetadata(): Promise<Metadata> {
  const published = await getPublishedProjects();
  const featuredFirst = published.find((p) => p.featured) ?? published[0];

  return buildMetadata({
    title: "Progetti",
    description:
      "Tutti i progetti di design e sviluppo firmati Cosimo Patronella.",
    path: "/progetti",
    ogImage: featuredFirst?.cover_image,
  });
}

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
        <SectionHeading title="Tutti i progetti." size="poster" as="h1" />
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

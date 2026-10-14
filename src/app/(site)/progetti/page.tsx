import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { WorkGrid } from "@/components/project/WorkGrid";
import { buildMetadata } from "@/lib/seo";
import { getPublishedProjects } from "@/lib/data/projects";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const published = await getPublishedProjects();
  const featuredFirst = published.find((p) => p.featured) ?? published[0];

  return buildMetadata({
    title: "Progetti di web design e grafica",
    description:
      "Siti web, identità visive e web app progettati e sviluppati da Cosimo Patronella: casi reali per associazioni culturali, artisti e studi creativi.",
    path: "/progetti",
    ogImage: featuredFirst?.cover_image,
  });
}

export default async function ProjectsIndexPage() {
  // Già ordinati per "sort_order" (l'ordine scelto in /admin).
  const projects = await getPublishedProjects();

  return (
    <div className="theme-paper container-px py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12 sm:pb-16">
        <SectionHeading title="Tutti i progetti." size="poster" as="h1" />
        <span className="font-display text-base font-semibold text-foreground-muted">
          {String(projects.length).padStart(2, "0")} progetti
        </span>
      </div>
      {projects.length === 0 ? (
        <p className="text-foreground-muted">Nessun progetto pubblicato ancora.</p>
      ) : (
        <WorkGrid projects={projects} priority headingLevel="h2" />
      )}
    </div>
  );
}

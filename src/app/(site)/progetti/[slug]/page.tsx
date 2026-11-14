import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { NextProject } from "@/components/project/NextProject";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { buildMetadata, projectJsonLd } from "@/lib/seo";
import { getProjectBySlug, getPublishedProjects } from "@/lib/data/projects";
import { getServicesForProject } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getPublishedProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/progetti/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};

  return buildMetadata({
    title: project.seo_title ?? project.title,
    description: project.seo_description ?? project.short_description,
    path: `/progetti/${project.slug}`,
    ogImage: project.seo_og_image ?? project.cover_image,
    noindex: project.seo_noindex,
  });
}

export default async function ProjectPage(
  props: PageProps<"/progetti/[slug]">,
) {
  const { slug } = await props.params;
  const [project, services, settings, allProjects] = await Promise.all([
    getProjectBySlug(slug),
    getServicesForProject(slug),
    getSiteSettings(),
    getPublishedProjects(),
  ]);
  const review = settings.home_content.reviews?.find(
    (r) =>
      r.visible &&
      (r.project_slug === slug || r.also_project_slugs?.includes(slug)),
  );
  if (!project) notFound();

  // Progetto successivo nell'ordine scelto in admin; dall'ultimo si torna
  // al primo. Nessuna fascia se c'è un solo progetto pubblicato.
  const index = allProjects.findIndex((p) => p.slug === slug);
  const next =
    allProjects.length > 1
      ? allProjects[(index + 1) % allProjects.length]
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd(project)),
        }}
      />
      <ProjectDetail
        project={project}
        services={services.map(({ slug, title }) => ({ slug, title }))}
        review={review}
      />
      <ClosingCta
        title="Ti piace questo lavoro?"
        text="Raccontami il tuo progetto: la prima consulenza è gratuita e senza impegno, e ti dico come lo farei."
        contactPhone={settings.contact_phone}
      />
      {next && next.slug !== slug ? <NextProject project={next} /> : null}
    </>
  );
}

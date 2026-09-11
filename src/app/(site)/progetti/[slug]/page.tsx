import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { buildMetadata, projectJsonLd } from "@/lib/seo";
import { getProjectBySlug } from "@/lib/data/projects";

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
    ogImage: project.seo_og_image,
    noindex: project.seo_noindex,
  });
}

export default async function ProjectPage(
  props: PageProps<"/progetti/[slug]">,
) {
  const { slug } = await props.params;
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(projectJsonLd(project)),
        }}
      />
      <ProjectDetail project={project} />
    </>
  );
}

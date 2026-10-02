import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ServicePageView } from "@/components/service/ServicePageView";
import { buildMetadata } from "@/lib/seo";
import { getPublishedServices, getServiceBySlug } from "@/lib/data/services";
import { getPublishedProjects } from "@/lib/data/projects";
import { pickProjects } from "@/lib/data/pickProjects";

export const revalidate = 3600;

export async function generateStaticParams() {
  const services = await getPublishedServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  props: PageProps<"/servizi/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = await getServiceBySlug(slug);
  if (!service) return {};

  return buildMetadata({
    title: service.seo_title ?? service.title,
    description: service.seo_description ?? service.excerpt,
    path: `/servizi/${service.slug}`,
    ogImage: service.seo_og_image,
    noindex: service.seo_noindex,
  });
}

export default async function ServicePage(props: PageProps<"/servizi/[slug]">) {
  const { slug } = await props.params;
  const [service, projects] = await Promise.all([
    getServiceBySlug(slug),
    getPublishedProjects(),
  ]);
  if (!service) notFound();

  return (
    <ServicePageView
      service={service}
      projects={pickProjects(projects, service.related_project_slugs)}
    />
  );
}

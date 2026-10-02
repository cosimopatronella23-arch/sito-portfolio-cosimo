import { notFound } from "next/navigation";
import { getServiceByIdAdmin } from "@/lib/data/services";
import { getPublishedProjects } from "@/lib/data/projects";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function EditServicePage(
  props: PageProps<"/admin/servizi/[id]">,
) {
  const { id } = await props.params;
  const [service, projects] = await Promise.all([
    getServiceByIdAdmin(id),
    getPublishedProjects(),
  ]);
  if (!service) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {service.title}
      </h1>
      <ServiceForm
        service={service}
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
      />
    </div>
  );
}

import { ServiceForm } from "@/components/admin/ServiceForm";
import { getPublishedProjects } from "@/lib/data/projects";

export default async function NewServicePage() {
  const projects = await getPublishedProjects();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Nuovo servizio
      </h1>
      <ServiceForm
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
      />
    </div>
  );
}

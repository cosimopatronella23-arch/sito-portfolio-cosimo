import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceByIdAdmin } from "@/lib/data/services";
import { getPublishedProjects } from "@/lib/data/projects";
import { ServiceForm } from "@/components/admin/ServiceForm";

export default async function EditServicePage(
  props: PageProps<"/admin/servizi/[id]">,
) {
  const { id } = await props.params;
  const { salvato } = await props.searchParams;
  const [service, projects] = await Promise.all([
    getServiceByIdAdmin(id),
    getPublishedProjects(),
  ]);
  if (!service) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/servizi"
        className="w-max text-sm text-foreground-muted hover:text-foreground"
      >
        ← Servizi
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
        {service.title}
      </h1>
      <ServiceForm
        service={service}
        created={salvato === "1"}
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
      />
    </div>
  );
}

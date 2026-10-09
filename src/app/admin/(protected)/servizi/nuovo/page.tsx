import Link from "next/link";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { getPublishedProjects } from "@/lib/data/projects";

export default async function NewServicePage() {
  const projects = await getPublishedProjects();

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/servizi"
        className="w-max text-sm text-foreground-muted hover:text-foreground"
      >
        ← Servizi
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Nuovo servizio
      </h1>
      <ServiceForm
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
      />
    </div>
  );
}

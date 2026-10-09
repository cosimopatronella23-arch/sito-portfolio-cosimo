import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/project/ProjectDetail";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { getProjectByIdAdmin } from "@/lib/data/projects";
import { getServicesForProject } from "@/lib/data/services";

// Sempre la versione appena salvata, mai una copia in cache.
export const dynamic = "force-dynamic";

/** Anteprima di un progetto (anche in bozza), solo per l'amministratore. */
export default async function ProjectPreviewPage(
  props: PageProps<"/admin/anteprima/progetti/[id]">,
) {
  const { id } = await props.params;
  const project = await getProjectByIdAdmin(id);
  if (!project) notFound();
  const services = await getServicesForProject(project.slug);

  return (
    <PreviewFrame
      published={project.status === "published"}
      editHref={`/admin/progetti/${project.id}`}
    >
      <ProjectDetail
        project={project}
        services={services.map(({ slug, title }) => ({ slug, title }))}
      />
    </PreviewFrame>
  );
}

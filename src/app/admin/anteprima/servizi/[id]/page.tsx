import { notFound } from "next/navigation";
import { ServicePageView } from "@/components/service/ServicePageView";
import { PreviewFrame } from "@/components/admin/PreviewFrame";
import { getServiceByIdAdmin } from "@/lib/data/services";
import { getPublishedProjects } from "@/lib/data/projects";
import { pickProjects } from "@/lib/data/pickProjects";

// Sempre la versione appena salvata, mai una copia in cache.
export const dynamic = "force-dynamic";

/**
 * Anteprima di un servizio (anche in bozza) con l'aspetto esatto del sito
 * pubblico. Sta sotto /admin: il proxy richiede il login e le regole del
 * database mostrano le bozze solo all'amministratore.
 */
export default async function ServicePreviewPage(
  props: PageProps<"/admin/anteprima/servizi/[id]">,
) {
  const { id } = await props.params;
  const [service, projects] = await Promise.all([
    getServiceByIdAdmin(id),
    getPublishedProjects(),
  ]);
  if (!service) notFound();

  return (
    <PreviewFrame
      published={service.status === "published"}
      editHref={`/admin/servizi/${service.id}`}
    >
      <ServicePageView
        service={service}
        projects={pickProjects(projects, service.related_project_slugs)}
      />
    </PreviewFrame>
  );
}

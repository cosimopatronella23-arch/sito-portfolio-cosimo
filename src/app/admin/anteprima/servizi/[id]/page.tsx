import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ServicePageView } from "@/components/service/ServicePageView";
import { getServiceByIdAdmin } from "@/lib/data/services";
import { getPublishedProjects } from "@/lib/data/projects";
import { getSiteSettings } from "@/lib/data/settings";
import { pickProjects } from "@/lib/data/pickProjects";
import { customColorsCss } from "@/lib/siteColors";

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
  const [service, projects, settings] = await Promise.all([
    getServiceByIdAdmin(id),
    getPublishedProjects(),
    getSiteSettings(),
  ]);
  if (!service) notFound();

  const customColors = customColorsCss(settings);

  return (
    <>
      {customColors ? <style>{`:root { ${customColors} }`}</style> : null}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-foreground px-4 py-2 text-center text-sm text-background">
        <span>
          Anteprima —{" "}
          {service.status === "published"
            ? "pagina pubblicata"
            : "bozza, non visibile sul sito"}
        </span>
        <a
          href={`/admin/servizi/${service.id}`}
          className="underline underline-offset-4"
        >
          Torna a modificare
        </a>
      </div>
      <Header navLinks={settings.home_content.nav_links} />
      <main className="flex-1">
        <ServicePageView
          service={service}
          projects={pickProjects(projects, service.related_project_slugs)}
        />
      </main>
      <Footer />
    </>
  );
}

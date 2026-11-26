import { getSiteSettings } from "@/lib/data/settings";
import { getPublishedProjects } from "@/lib/data/projects";
import { ReviewsManager } from "@/components/admin/ReviewsManager";
import { PageHeader } from "@/components/admin/settings/PageHeader";

// Sempre i dati del momento, come il resto dell'admin.
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [settings, projects] = await Promise.all([getSiteSettings(), getPublishedProjects()]);

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        crumb="Contenuti"
        title="Recensioni"
        lead="Una riga per recensione. Clic sul nome per aprirla e modificarla. Compaiono in homepage e, se collegate a un progetto, anche nella sua pagina."
      />
      <ReviewsManager
        initial={settings.home_content.reviews ?? []}
        projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
        googleLink={settings.social_links.google}
      />
    </div>
  );
}

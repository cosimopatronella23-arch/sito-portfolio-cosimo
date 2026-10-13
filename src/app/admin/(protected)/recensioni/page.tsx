import { getSiteSettings } from "@/lib/data/settings";
import { getPublishedProjects } from "@/lib/data/projects";
import { updateReviews } from "@/lib/actions/reviews";
import { EditorForm } from "@/components/admin/EditorForm";
import { ReviewsEditor } from "@/components/admin/ReviewsEditor";

// Sempre i dati del momento, come il resto dell'admin.
export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const [settings, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedProjects(),
  ]);
  const reviews = settings.home_content.reviews ?? [];
  const googleLink = settings.social_links.google;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Recensioni
        </h1>
        <p className="max-w-2xl text-sm text-foreground-muted">
          Le recensioni dei clienti mostrate sul sito: in homepage prima dei
          Contatti e, se collegate a un progetto, anche nella sua pagina.
          Finché non ce n&apos;è nessuna visibile, la sezione non compare.
        </p>
      </div>
      <EditorForm
        action={updateReviews}
        submitLabel="Salva recensioni"
        sidebar={
          <p className="text-sm text-foreground-muted">
            Copia nome, testo e stelle dalla recensione su Google, così
            restano identiche all&apos;originale.
          </p>
        }
        sidebarFooter={
          googleLink ? (
            <a
              href={googleLink}
              target="_blank"
              rel="noopener"
              className="text-sm text-foreground-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              Apri il profilo Google
            </a>
          ) : null
        }
      >
        <ReviewsEditor
          name="reviews"
          defaultValue={reviews}
          projects={projects.map((p) => ({ slug: p.slug, title: p.title }))}
        />
      </EditorForm>
    </div>
  );
}

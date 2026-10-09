import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects";
import { deleteProject, duplicateProject } from "@/lib/actions/projects";
import { ContentList } from "@/components/admin/ContentList";
import { AdminIcon } from "@/components/admin/AdminIcons";

export default async function AdminProjectsPage() {
  const projects = (await getAllProjectsAdmin()).sort(
    (a, b) => a.sort_order - b.sort_order,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Progetti
          </h1>
          <p className="text-sm text-foreground-muted">
            L&apos;ordine qui è quello del sito, in homepage e in /progetti.
          </p>
        </div>
        <Link
          href="/admin/progetti/nuovo"
          className="inline-flex min-h-11 items-center gap-2 bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          <AdminIcon name="plus" className="h-4 w-4" />
          Nuovo progetto
        </Link>
      </div>

      <ContentList
        reorderTable="projects"
        duplicateAction={duplicateProject}
        deleteAction={deleteProject}
        emptyText="Nessun progetto ancora. Creane uno."
        items={projects.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          thumbnail: p.cover_image,
          subtitle: [p.category, p.year].filter(Boolean).join(" · "),
          badges: p.featured ? ["In evidenza"] : [],
          editHref: `/admin/progetti/${p.id}`,
          previewHref: `/admin/anteprima/progetti/${p.id}`,
          publicHref: `/progetti/${p.slug}`,
        }))}
      />
    </div>
  );
}

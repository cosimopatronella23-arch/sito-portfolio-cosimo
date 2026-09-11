import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects";
import { deleteProject } from "@/lib/actions/projects";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminProjectsPage() {
  const projects = await getAllProjectsAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Progetti
        </h1>
        <Link
          href="/admin/progetti/nuovo"
          className="bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          + Nuovo progetto
        </Link>
      </div>

      <div className="flex flex-col">
        {projects.length === 0 ? (
          <p className="py-10 text-foreground-muted">
            Nessun progetto ancora. Creane uno.
          </p>
        ) : null}
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 first:border-t"
          >
            <div className="flex items-center gap-4">
              <span
                className={
                  project.status === "published"
                    ? "text-xs text-success"
                    : "text-xs text-warning"
                }
              >
                {project.status === "published" ? "Pubblicato" : "Bozza"}
              </span>
              <span className="font-display text-lg font-semibold">
                {project.title}
              </span>
              {project.featured ? (
                <span className="text-xs text-foreground-muted">
                  In evidenza
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-5">
              <Link
                href={`/admin/progetti/${project.id}`}
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Modifica
              </Link>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={project.id} />
                <DeleteButton />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

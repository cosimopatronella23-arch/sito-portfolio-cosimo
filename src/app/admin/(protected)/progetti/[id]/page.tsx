import Link from "next/link";
import { notFound } from "next/navigation";
import { getRevisionsAdmin } from "@/lib/data/history";
import { getProjectByIdAdmin } from "@/lib/data/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function EditProjectPage(
  props: PageProps<"/admin/progetti/[id]">,
) {
  const { id } = await props.params;
  const { salvato } = await props.searchParams;
  const project = await getProjectByIdAdmin(id);
  if (!project) notFound();
  const revisions = await getRevisionsAdmin("projects", project.id);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/progetti"
        className="w-max text-sm text-foreground-muted hover:text-foreground"
      >
        ← Progetti
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight text-balance">
        {project.title}
      </h1>
      <ProjectForm project={project} created={salvato === "1"}
        revisions={revisions} />
    </div>
  );
}

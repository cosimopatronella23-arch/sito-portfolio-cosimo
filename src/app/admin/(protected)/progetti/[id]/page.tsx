import { notFound } from "next/navigation";
import { getProjectByIdAdmin } from "@/lib/data/projects";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default async function EditProjectPage(
  props: PageProps<"/admin/progetti/[id]">,
) {
  const { id } = await props.params;
  const project = await getProjectByIdAdmin(id);
  if (!project) notFound();

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        {project.title}
      </h1>
      <ProjectForm project={project} />
    </div>
  );
}

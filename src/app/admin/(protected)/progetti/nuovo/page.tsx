import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Nuovo progetto
      </h1>
      <ProjectForm />
    </div>
  );
}

import Link from "next/link";
import { ProjectForm } from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/admin/progetti"
        className="w-max text-sm text-foreground-muted hover:text-foreground"
      >
        ← Progetti
      </Link>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Nuovo progetto
      </h1>
      <ProjectForm />
    </div>
  );
}

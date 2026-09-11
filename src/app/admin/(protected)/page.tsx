import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects";
import { getAllPostsAdmin } from "@/lib/data/blog";
import { ExportButton } from "@/components/admin/ExportButton";

export default async function AdminDashboardPage() {
  const [projects, posts] = await Promise.all([
    getAllProjectsAdmin(),
    getAllPostsAdmin(),
  ]);

  const publishedProjects = projects.filter((p) => p.status === "published");
  const publishedPosts = posts.filter((p) => p.status === "published");

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Ciao Cosimo.
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Link
          href="/admin/progetti"
          className="flex flex-col gap-2 border border-border-strong p-6 transition-colors hover:border-accent"
        >
          <span className="font-display text-4xl font-semibold">
            {publishedProjects.length}
            <span className="text-lg text-foreground-muted">
              {" "}
              / {projects.length}
            </span>
          </span>
          <span className="text-sm text-foreground-muted">
            Progetti pubblicati / totali →
          </span>
        </Link>

        <Link
          href="/admin/blog"
          className="flex flex-col gap-2 border border-border-strong p-6 transition-colors hover:border-accent"
        >
          <span className="font-display text-4xl font-semibold">
            {publishedPosts.length}
            <span className="text-lg text-foreground-muted">
              {" "}
              / {posts.length}
            </span>
          </span>
          <span className="text-sm text-foreground-muted">
            Articoli pubblicati / totali →
          </span>
        </Link>
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-8">
        <h2 className="font-display text-lg font-semibold">Backup</h2>
        <p className="max-w-md text-sm text-foreground-muted">
          Scarica un file con tutti i contenuti attuali (progetti, articoli,
          impostazioni). Utile da tenere da parte ogni tanto.
        </p>
        <ExportButton />
      </div>
    </div>
  );
}

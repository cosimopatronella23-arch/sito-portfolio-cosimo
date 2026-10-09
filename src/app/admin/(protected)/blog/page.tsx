import Link from "next/link";
import { getAllPostsAdmin } from "@/lib/data/blog";
import { deletePost, duplicatePost } from "@/lib/actions/blog";
import { ContentList } from "@/components/admin/ContentList";
import { AdminIcon } from "@/components/admin/AdminIcons";

const dateFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function AdminBlogPage() {
  const posts = (await getAllPostsAdmin()).sort((a, b) =>
    (b.published_at ?? "").localeCompare(a.published_at ?? ""),
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Blog
        </h1>
        <Link
          href="/admin/blog/nuovo"
          className="inline-flex min-h-11 items-center gap-2 bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          <AdminIcon name="plus" className="h-4 w-4" />
          Nuovo articolo
        </Link>
      </div>

      <ContentList
        duplicateAction={duplicatePost}
        deleteAction={deletePost}
        emptyText="Nessun articolo ancora. Scrivine uno."
        items={posts.map((p) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          badges:
            p.status === "published" &&
            p.published_at &&
            new Date(p.published_at) > new Date()
              ? ["Programmato"]
              : [],
          thumbnail: p.cover_image,
          subtitle: [
            p.category,
            p.published_at ? dateFormat.format(new Date(p.published_at)) : "",
          ]
            .filter(Boolean)
            .join(" · "),
          editHref: `/admin/blog/${p.id}`,
          previewHref: `/admin/anteprima/blog/${p.id}`,
          publicHref: `/blog/${p.slug}`,
        }))}
      />
    </div>
  );
}

import Link from "next/link";
import { getAllPostsAdmin } from "@/lib/data/blog";
import { deletePost, duplicatePost } from "@/lib/actions/blog";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminBlogPage() {
  const posts = await getAllPostsAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Blog
        </h1>
        <Link
          href="/admin/blog/nuovo"
          className="bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          + Nuovo articolo
        </Link>
      </div>

      <div className="flex flex-col">
        {posts.length === 0 ? (
          <p className="py-10 text-foreground-muted">
            Nessun articolo ancora. Scrivine uno.
          </p>
        ) : null}
        {posts.map((post) => (
          <div
            key={post.id}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 first:border-t"
          >
            <div className="flex items-center gap-4">
              <span
                className={
                  post.status === "published"
                    ? "text-xs text-success"
                    : "text-xs text-warning"
                }
              >
                {post.status === "published" ? "Pubblicato" : "Bozza"}
              </span>
              <span className="font-display text-lg font-semibold">
                {post.title}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <Link
                href={`/admin/blog/${post.id}`}
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Modifica
              </Link>
              <form action={duplicatePost}>
                <input type="hidden" name="id" value={post.id} />
                <button
                  type="submit"
                  className="text-sm text-foreground-muted hover:text-foreground"
                >
                  Duplica
                </button>
              </form>
              <form action={deletePost}>
                <input type="hidden" name="id" value={post.id} />
                <DeleteButton />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

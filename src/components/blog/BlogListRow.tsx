import Link from "next/link";
import type { BlogPost } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

/**
 * Riga stile "indice di rivista": niente immagini, solo tipografia —
 * numero, titolo, categoria e data.
 */
export function BlogListRow({
  post,
  index = 0,
}: {
  post: BlogPost;
  index?: number;
}) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-cursor="link"
      data-cursor-text="Leggi"
      className="group flex flex-col gap-2 border-b border-border py-7 first:border-t sm:flex-row sm:items-baseline sm:justify-between sm:gap-6 sm:py-8"
    >
      <div className="flex items-baseline gap-5">
        <span className="font-display text-sm text-foreground/30">
          {String(index + 1).padStart(2, "0")}
        </span>
        <h3 className="font-display text-xl font-semibold tracking-tight transition-colors duration-300 group-hover:text-accent sm:text-2xl">
          {post.title}
        </h3>
      </div>
      <div className="flex items-center gap-4 pl-10 text-sm text-foreground-muted sm:pl-0">
        <span>{post.category}</span>
        <time dateTime={post.published_at}>
          {dateFormatter.format(new Date(post.published_at))}
        </time>
        <span
          aria-hidden="true"
          className="transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </Link>
  );
}

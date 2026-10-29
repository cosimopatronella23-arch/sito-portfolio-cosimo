import Link from "next/link";
import type { BlogPost } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/**
 * Scheda articolo solo tipografica: niente immagini decorative, il titolo è
 * il protagonista. Al passaggio del mouse il titolo si sottolinea e la
 * freccia scatta in avanti.
 */
export function BlogCard({
  post,
  headingLevel = "h3",
}: {
  post: BlogPost;
  /** Non più usato (le schede non hanno immagini); resta per compatibilità. */
  index?: number;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link
      href={`/blog/${post.slug}`}
      data-cursor="link"
      className="group flex h-full flex-col border-t border-border-strong pt-6"
    >
      <div className="flex justify-between gap-4 text-xs tracking-[0.12em] text-foreground-muted uppercase">
        <span className="text-[var(--highlight,var(--accent))]">{post.category}</span>
        <time dateTime={post.published_at}>{dateFormat.format(new Date(post.published_at))}</time>
      </div>
      <Heading className="font-display mt-5 text-2xl leading-[1.12] font-bold tracking-[-0.025em] text-balance sm:text-[1.75rem]">
        <span className="link-draw">{post.title}</span>
      </Heading>
      {post.excerpt ? (
        <p className="mt-4 line-clamp-3 leading-relaxed text-foreground-muted">{post.excerpt}</p>
      ) : null}
      <span className="mt-auto flex items-center gap-2 pt-6 text-xs font-semibold tracking-[0.12em] uppercase">
        Leggi l&apos;articolo
        <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
          →
        </span>
      </span>
    </Link>
  );
}

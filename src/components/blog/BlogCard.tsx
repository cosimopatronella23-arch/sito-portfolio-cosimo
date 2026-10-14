import Link from "next/link";
import { CoverImage } from "@/components/ui/CoverImage";
import type { BlogPost } from "@/lib/types";

const dateFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

/** Scheda articolo: la copertina si avvicina e il titolo si sottolinea. */
export function BlogCard({
  post,
  index,
  headingLevel = "h3",
}: {
  post: BlogPost;
  index: number;
  headingLevel?: "h2" | "h3";
}) {
  const Heading = headingLevel;
  return (
    <Link href={`/blog/${post.slug}`} data-cursor="link" className="group flex flex-col">
      <div className="aspect-[16/10] overflow-hidden bg-surface">
        <CoverImage
          src={post.cover_image}
          alt={post.title}
          index={index}
          sizes="(min-width: 768px) 33vw, 100vw"
          className="h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
        />
      </div>
      <div className="mt-5 flex justify-between gap-4 text-xs tracking-[0.12em] text-foreground-muted uppercase">
        <span className="text-[var(--highlight,var(--accent))]">{post.category}</span>
        <time dateTime={post.published_at}>{dateFormat.format(new Date(post.published_at))}</time>
      </div>
      <Heading className="font-display mt-3 text-2xl leading-[1.15] font-semibold tracking-[-0.02em]">
        <span className="link-draw">{post.title}</span>
      </Heading>
      {post.excerpt ? (
        <p className="mt-3 line-clamp-3 leading-relaxed text-foreground-muted">{post.excerpt}</p>
      ) : null}
    </Link>
  );
}

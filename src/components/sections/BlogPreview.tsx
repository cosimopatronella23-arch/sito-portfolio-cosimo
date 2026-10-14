import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import { getPublishedPosts } from "@/lib/data/blog";
import type { SectionTheme } from "@/lib/types";


/** Ultimi 3 articoli: copertina che si avvicina e titolo che si sottolinea. */
export async function BlogPreview({ theme }: { theme: SectionTheme }) {
  const latest = (await getPublishedPosts()).slice(0, 3);
  if (latest.length === 0) return null;

  return (
    <section id="blog" className={`theme-${theme} container-px py-24 sm:py-32`}>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12 sm:pb-16">
        <SectionHeading title="Dal blog." size="poster" />
        <Link href="/blog" data-cursor="link" className="link-draw text-sm font-semibold tracking-[0.1em] uppercase">
          Tutti gli articoli →
        </Link>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-12 md:grid-cols-3">
        {latest.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </section>
  );
}

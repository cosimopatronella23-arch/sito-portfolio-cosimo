import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogListRow } from "@/components/blog/BlogListRow";
import { getPublishedPosts } from "@/lib/data/blog";
import { sectionStyle } from "@/lib/contrast";

export async function BlogPreview({
  backgroundColor,
}: {
  backgroundColor?: string;
} = {}) {
  const posts = await getPublishedPosts();
  const latest = posts.slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section
      id="blog"
      style={sectionStyle(backgroundColor)}
      className="container-px py-24 sm:py-32"
    >
      <div className="flex flex-col gap-14">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading title="Cose che scrivo, tra un progetto e l'altro." />
          <Link
            href="/blog"
            data-cursor="link"
            className="text-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 hover:text-accent"
          >
            Tutti gli articoli →
          </Link>
        </div>

        <div className="flex flex-col">
          {latest.map((post, i) => (
            <BlogListRow key={post.id} post={post} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

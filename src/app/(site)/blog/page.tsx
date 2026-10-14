import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogCard } from "@/components/blog/BlogCard";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/data/blog";

export async function generateMetadata(): Promise<Metadata> {
  const published = await getPublishedPosts();

  return buildMetadata({
    title: "Blog su web design, SEO e siti web",
    description:
      "Note pratiche su design, sviluppo frontend, performance e SEO tecnica, da progetti reali.",
    path: "/blog",
    ogImage: published[0]?.cover_image,
  });
}

export default async function BlogIndexPage() {
  const published = await getPublishedPosts();

  return (
    <div className="theme-ink container-px py-20 sm:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12 sm:pb-16">
        <SectionHeading title="Tutti gli articoli." size="poster" as="h1" />
        <span className="font-display text-base font-semibold text-foreground-muted">
          {String(published.length).padStart(2, "0")} articoli
        </span>
      </div>
      <div className="grid grid-cols-1 gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
        {published.map((post, i) => (
          <BlogCard key={post.id} post={post} index={i} headingLevel="h2" />
        ))}
      </div>
    </div>
  );
}

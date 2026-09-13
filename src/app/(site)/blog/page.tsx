import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogListRow } from "@/components/blog/BlogListRow";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/data/blog";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description:
    "Note pratiche su design, sviluppo frontend, performance e SEO tecnica, da progetti reali.",
  path: "/blog",
});

export default async function BlogIndexPage() {
  const published = await getPublishedPosts();

  return (
    <div className="container-px py-20 sm:py-28">
      <div className="flex flex-col gap-14">
        <SectionHeading title="Tutti gli articoli." size="poster" />

        <div className="flex flex-col">
          {published.map((post, i) => (
            <BlogListRow key={post.id} post={post} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

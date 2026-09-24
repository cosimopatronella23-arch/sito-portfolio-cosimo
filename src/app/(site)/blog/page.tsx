import type { Metadata } from "next";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BlogListRow } from "@/components/blog/BlogListRow";
import { buildMetadata } from "@/lib/seo";
import { getPublishedPosts } from "@/lib/data/blog";

export async function generateMetadata(): Promise<Metadata> {
  const published = await getPublishedPosts();

  return buildMetadata({
    title: "Blog",
    description:
      "Note pratiche su design, sviluppo frontend, performance e SEO tecnica, da progetti reali.",
    path: "/blog",
    ogImage: published[0]?.cover_image,
  });
}

export default async function BlogIndexPage() {
  const published = await getPublishedPosts();

  return (
    <div className="container-px py-20 sm:py-28">
      <div className="flex flex-col gap-14">
        <SectionHeading title="Tutti gli articoli." size="poster" as="h1" />

        <div className="flex flex-col">
          {published.map((post, i) => (
            <BlogListRow key={post.id} post={post} index={i} headingLevel="h2" />
          ))}
        </div>
      </div>
    </div>
  );
}

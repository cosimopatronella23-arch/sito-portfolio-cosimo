import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/ui/CoverImage";
import { buildMetadata, blogPostJsonLd } from "@/lib/seo";
import { getPostBySlug } from "@/lib/data/blog";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export async function generateMetadata(
  props: PageProps<"/blog/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) return {};

  return buildMetadata({
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt,
    path: `/blog/${post.slug}`,
    ogImage: post.seo_og_image,
    noindex: post.seo_noindex,
  });
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  return (
    <article className="container-px py-20 sm:py-28">
      <div className="flex flex-col gap-10">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(blogPostJsonLd(post)),
          }}
        />

        <Link
          href="/blog"
          className="w-max text-sm text-foreground-muted hover:text-foreground"
        >
          ← Tutti gli articoli
        </Link>

        <header className="flex flex-col gap-5">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {post.title}
          </h1>
          <p className="text-sm text-foreground-muted">
            {post.category} ·{" "}
            <time dateTime={post.published_at}>
              {dateFormatter.format(new Date(post.published_at))}
            </time>
          </p>
        </header>

        <div className="aspect-[16/9] w-full overflow-hidden">
          <CoverImage
            src={post.cover_image}
            alt={post.title}
            priority
            className="h-full w-full"
          />
        </div>

        <div
          className="prose-editor max-w-3xl text-base leading-relaxed text-foreground-muted"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}

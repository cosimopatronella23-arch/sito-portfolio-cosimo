import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CoverImage } from "@/components/ui/CoverImage";
import { buildMetadata, blogPostJsonLd } from "@/lib/seo";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/blog";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

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
      {/* Colonna unica per testo E immagine: prima l'immagine di copertina
          era a piena larghezza mentre il testo restava stretto, uno squilibrio
          che la faceva sembrare sproporzionata rispetto al resto. Ora
          condividono la stessa larghezza, come un vero editoriale. */}
      <div className="mx-auto flex max-w-3xl flex-col gap-10">
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
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            {post.category}
          </p>
          <h1 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] font-semibold tracking-tight text-balance">
            {post.title}
          </h1>
          <time
            dateTime={post.published_at}
            className="text-sm text-foreground-muted"
          >
            {dateFormatter.format(new Date(post.published_at))}
          </time>
        </header>

        {post.cover_image ? (
          <div className="aspect-[3/2] w-full overflow-hidden border border-border-strong">
            <CoverImage
              src={post.cover_image}
              alt={post.title}
              priority
              className="h-full w-full"
            />
          </div>
        ) : null}

        <div
          className="prose-editor text-base leading-relaxed text-foreground-muted"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </article>
  );
}

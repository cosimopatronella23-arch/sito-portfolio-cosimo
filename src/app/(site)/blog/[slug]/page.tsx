import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { getPostBySlug, getPublishedPosts } from "@/lib/data/blog";
import { getSiteSettings } from "@/lib/data/settings";

export const revalidate = 3600;

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

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
    // Senza immagine scelta in admin vale quella generata dal sito
    // (opengraph-image.tsx), con il titolo dell'articolo.
    ogImage: post.seo_og_image,
    noindex: post.seo_noindex,
  });
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const [post, settings] = await Promise.all([
    getPostBySlug(slug),
    getSiteSettings(),
  ]);
  if (!post) notFound();

  return <BlogPostView post={post} contactPhone={settings.contact_phone} />;
}

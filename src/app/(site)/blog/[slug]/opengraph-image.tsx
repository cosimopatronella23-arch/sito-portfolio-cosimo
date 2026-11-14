import { ogSize, renderOgImage } from "@/lib/og/renderOgImage";
import { getPostBySlug } from "@/lib/data/blog";

export const alt = "Articolo del blog di Cosimo Patronella";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  return renderOgImage({
    title: post?.title ?? "Blog",
    category: post?.category,
    footer: "cosimopatronella.it/blog",
  });
}

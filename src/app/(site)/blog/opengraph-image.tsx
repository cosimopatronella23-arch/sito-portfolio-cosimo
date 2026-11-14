import { ogSize, renderOgImage } from "@/lib/og/renderOgImage";

export const alt = "Blog di Cosimo Patronella";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Blog su web design, SEO e siti web",
    footer: "cosimopatronella.it/blog",
  });
}

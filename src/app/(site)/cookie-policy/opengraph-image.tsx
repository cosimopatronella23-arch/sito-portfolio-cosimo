import { ogSize, renderOgImage } from "@/lib/og/renderOgImage";

export const alt = "Cookie Policy di cosimopatronella.it";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Cookie Policy",
    category: "Informativa",
    footer: "cosimopatronella.it/cookie-policy",
  });
}

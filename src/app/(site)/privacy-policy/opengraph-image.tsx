import { ogSize, renderOgImage } from "@/lib/og/renderOgImage";

export const alt = "Privacy Policy di cosimopatronella.it";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: "Privacy Policy",
    category: "Informativa",
    footer: "cosimopatronella.it/privacy-policy",
  });
}

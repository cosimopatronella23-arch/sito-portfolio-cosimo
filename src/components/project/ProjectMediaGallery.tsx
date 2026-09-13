"use client";

import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import { isVideoUrl } from "@/lib/isVideoUrl";
import type { GalleryItem } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Righe in base alla scelta fatta per ogni elemento in admin: "full" è
 * sempre da sola, "half" si affianca alla successiva SOLO se anche quella è
 * "half" — un'affiancata rimasta sola (perché seguita da una intera, o
 * perché è l'ultima) diventa comunque a tutta larghezza, per non lasciare
 * un vuoto a metà riga.
 */
function toRows(items: GalleryItem[]): GalleryItem[][] {
  const rows: GalleryItem[][] = [];
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (item.layout === "half" && items[i + 1]?.layout === "half") {
      rows.push([item, items[i + 1]]);
      i += 2;
    } else {
      rows.push([item]);
      i += 1;
    }
  }
  return rows;
}

function Media({
  src,
  alt,
  aspect,
  priority,
}: {
  src: string;
  alt: string;
  aspect: "16/9" | "square";
  priority?: boolean;
}) {
  const aspectClass = aspect === "square" ? "aspect-square" : "aspect-[16/9]";

  return (
    <div className={`${aspectClass} w-full overflow-hidden`}>
      {isVideoUrl(src) ? (
        <video
          src={src}
          autoPlay
          muted
          loop
          playsInline
          className="h-full w-full object-cover"
        />
      ) : (
        <CoverImage src={src} alt={alt} priority={priority} className="h-full w-full" />
      )}
    </div>
  );
}

/**
 * Galleria progetto: ogni foto/video segue il layout scelto in admin
 * (intera o affiancata) — niente decisione automatica che rischi di
 * ritagliare a quadrato qualcosa che doveva restare intero. Tutto visibile
 * scorrendo la pagina, niente scorrimento automatico che nasconde
 * contenuti. Ogni riga entra con una micro-animazione allo scroll.
 */
export function ProjectMediaGallery({
  items,
  alt,
}: {
  items: GalleryItem[];
  alt: string;
}) {
  if (items.length === 0) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden">
        <CoverImage src={null} alt={alt} priority className="h-full w-full" />
      </div>
    );
  }

  const rows = toRows(items);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <div
          key={row.map((r) => r.url).join("-")}
          className={
            row.length === 2
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
              : undefined
          }
        >
          {row.map((item, i) => (
            <motion.div
              key={item.url}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
            >
              <Media
                src={item.url}
                alt={alt}
                aspect={row.length === 2 ? "square" : "16/9"}
                priority={rowIndex === 0}
              />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

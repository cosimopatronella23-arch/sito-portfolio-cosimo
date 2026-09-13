"use client";

import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import { isVideoUrl } from "@/lib/isVideoUrl";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/** Righe da 1 (a tutta larghezza) e 2 (affiancate) alternate: 1, 2, 1, 2... */
function toRows(items: string[]): string[][] {
  const rows: string[][] = [];
  let i = 0;
  let single = true;
  while (i < items.length) {
    const size = single ? 1 : 2;
    rows.push(items.slice(i, i + size));
    i += size;
    single = !single;
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
 * Galleria progetto: righe alternate tra "un elemento a tutta larghezza" e
 * "due affiancati" (1, 2, 1, 2...) — tutto visibile scorrendo la pagina,
 * niente scorrimento automatico che nasconde contenuti. Foto e video (MP4/
 * WebM, muti e in loop) si mescolano liberamente. Ogni riga entra con una
 * micro-animazione allo scroll, rispettando prefers-reduced-motion (gestito
 * a livello globale in globals.css).
 */
export function ProjectMediaGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden">
        <CoverImage src={null} alt={alt} priority className="h-full w-full" />
      </div>
    );
  }

  const rows = toRows(images);

  return (
    <div className="flex flex-col gap-4">
      {rows.map((row, rowIndex) => (
        <div
          key={row.join("-")}
          className={
            row.length === 2
              ? "grid grid-cols-1 gap-4 sm:grid-cols-2"
              : undefined
          }
        >
          {row.map((src, i) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
            >
              <Media
                src={src}
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

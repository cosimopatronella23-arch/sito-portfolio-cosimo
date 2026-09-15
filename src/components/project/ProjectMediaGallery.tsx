"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
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

/**
 * Elemento "affiancato" (due per riga): resta in un riquadro quadrato con
 * ritaglio, altrimenti due immagini di proporzioni diverse non si
 * allineerebbero in riga. Ha un leggero effetto parallasse: mentre la riga
 * scorre nel viewport, il contenuto si muove più lentamente dello scroll
 * stesso — lo zoom fisso (scale-110) dà il margine perché il movimento non
 * scopra mai un bordo vuoto.
 */
function CroppedGalleryMedia({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-6%", "6%"]);

  return (
    <div ref={ref} className="aspect-square w-full overflow-hidden">
      <motion.div
        style={shouldReduceMotion ? undefined : { y }}
        className="h-full w-full scale-110"
      >
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
      </motion.div>
    </div>
  );
}

/**
 * Elemento a tutta larghezza: nessun ritaglio. Larghezza sempre al 100%,
 * altezza libera in base alle proporzioni reali del file — così una foto
 * verticale e una orizzontale nella stessa galleria hanno semplicemente
 * altezze diverse, invece di essere forzate nello stesso rettangolo.
 */
function FullGalleryMedia({ src, alt }: { src: string; alt: string }) {
  if (isVideoUrl(src)) {
    return (
      <video
        src={src}
        autoPlay
        muted
        loop
        playsInline
        className="h-auto w-full"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element -- larghezza nota, altezza no: qui serve l'altezza naturale dell'immagine, non quella forzata dal fill di next/image.
    <img src={src} alt={alt} className="h-auto w-full" />
  );
}

/**
 * Galleria progetto: ogni foto/video segue il layout scelto in admin
 * (intera o affiancata) — niente decisione automatica che rischi di
 * ritagliare a quadrato qualcosa che doveva restare intero. Tutto visibile
 * scorrendo la pagina, niente scorrimento automatico che nasconde
 * contenuti. Ogni riga entra con una micro-animazione allo scroll, e ogni
 * immagine si muove poi con un leggero parallasse mentre la si scorre.
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
            row.length === 2 ? "grid grid-cols-2 gap-3 sm:gap-4" : undefined
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
              {row.length === 2 ? (
                <CroppedGalleryMedia
                  src={item.url}
                  alt={alt}
                  priority={rowIndex === 0}
                />
              ) : (
                <FullGalleryMedia src={item.url} alt={alt} />
              )}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
}

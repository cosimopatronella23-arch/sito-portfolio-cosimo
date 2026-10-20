"use client";

import { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { CoverImage } from "@/components/ui/CoverImage";
import { isVideoUrl } from "@/lib/isVideoUrl";
import { GallerySlideshow } from "./GallerySlideshow";
import type { GalleryItem } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

type Row = { kind: "single" | "pair" | "slideshow"; items: GalleryItem[] };

/**
 * Righe in base alla scelta fatta per ogni elemento in admin: "full" è
 * sempre da sola, "half" si affianca alla successiva SOLO se anche quella è
 * "half" — un'affiancata rimasta sola (perché seguita da una intera, o
 * perché è l'ultima) diventa comunque a tutta larghezza, per non lasciare
 * un vuoto a metà riga. Le "slide" consecutive (solo immagini) formano una
 * sequenza che si alterna da sola; una "slide" rimasta sola è intera.
 */
function toRows(items: GalleryItem[]): Row[] {
  const rows: Row[] = [];
  const isSlide = (item?: GalleryItem) =>
    item?.layout === "slide" && !isVideoUrl(item.url);
  let i = 0;
  while (i < items.length) {
    const item = items[i];
    if (isSlide(item)) {
      const group: GalleryItem[] = [];
      while (isSlide(items[i])) group.push(items[i++]);
      rows.push({
        kind: group.length > 1 ? "slideshow" : "single",
        items: group,
      });
    } else if (item.layout === "half" && items[i + 1]?.layout === "half") {
      rows.push({ kind: "pair", items: [item, items[i + 1]] });
      i += 2;
    } else {
      rows.push({ kind: "single", items: [item] });
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
          <CoverImage
            src={src}
            alt={alt}
            priority={priority}
            className="h-full w-full"
          />
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
function FullGalleryMedia({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
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

  // width/height a 0 + sizes: next/image serve comunque la versione
  // ottimizzata (AVIF/WebP, ridimensionata sullo schermo) senza conoscere
  // in anticipo le dimensioni, e l'altezza segue le proporzioni del file.
  return (
    <Image
      src={src}
      alt={alt}
      width={0}
      height={0}
      sizes="100vw"
      priority={priority}
      className="h-auto w-full"
    />
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
      {rows.map((row, rowIndex) =>
        row.kind === "slideshow" ? (
          <motion.div
            key={row.items.map((r) => r.url).join("-")}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, ease: EASE_OUT }}
          >
            <GallerySlideshow items={row.items} alt={alt} />
          </motion.div>
        ) : (
          <div
            key={row.items.map((r) => r.url).join("-")}
            className={
              row.kind === "pair"
                ? "grid grid-cols-2 gap-3 sm:gap-4"
                : undefined
            }
          >
            {row.items.map((item, i) => (
              <motion.div
                key={item.url}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: EASE_OUT }}
              >
                {row.kind === "pair" ? (
                  <CroppedGalleryMedia
                    src={item.url}
                    alt={item.alt || alt}
                    priority={rowIndex === 0}
                  />
                ) : (
                  <FullGalleryMedia
                    src={item.url}
                    alt={item.alt || alt}
                    priority={rowIndex === 0}
                  />
                )}
              </motion.div>
            ))}
          </div>
        ),
      )}
    </div>
  );
}

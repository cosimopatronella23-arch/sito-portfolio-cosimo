"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import { isVideoUrl } from "@/lib/isVideoUrl";

// Ritmo "flipbook": le immagini scorrono veloci per far capire subito che è
// una galleria, anche solo scorrendo la pagina. I video invece si guardano
// per intero (durata naturale) prima di passare oltre — vedi onEnded.
const IMAGE_DURATION_MS = 1000;

/**
 * Immagine o video per una singola slide del carosello. Il video non è in
 * loop qui (a differenza dell'anteprima in admin): deve arrivare alla fine
 * per far scattare `onEnded` e passare alla slide successiva. `paused`
 * ferma/riprende anche la riproduzione del video, non solo l'avanzamento.
 */
function MediaSlide({
  src,
  alt,
  priority,
  paused,
  onEnded,
}: {
  src: string | null;
  alt: string;
  priority?: boolean;
  paused?: boolean;
  onEnded?: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(() => {});
  }, [paused]);

  if (src && isVideoUrl(src)) {
    return (
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        playsInline
        onEnded={onEnded}
        onError={onEnded}
        className="h-full w-full object-cover"
      />
    );
  }

  return (
    <CoverImage src={src} alt={alt} priority={priority} className="h-full w-full" />
  );
}

/**
 * Copertina progetto: se c'è solo un'immagine, statica come prima. Se ce ne
 * sono altre (foto/video), scorre da sola in stile "flipbook" — immagini
 * veloci, video guardati per intero — e si ferma davvero (avanzamento +
 * riproduzione) al passaggio del mouse/focus. Indicatori sempre visibili
 * (anche da mobile, dove l'hover non esiste) per far capire subito che è
 * una galleria. Rispetta prefers-reduced-motion (niente autoplay).
 */
export function ProjectCoverCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const prefersReducedMotion = useRef(false);

  useEffect(() => {
    prefersReducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  function advance() {
    if (prefersReducedMotion.current) return;
    setIndex((i) => (i + 1) % images.length);
  }

  const current = images[index];
  const currentIsVideo = Boolean(current && isVideoUrl(current));

  // Le immagini avanzano da sole dopo un tempo fisso breve; i video invece
  // avanzano quando finiscono di riprodursi (gestito da MediaSlide/onEnded).
  useEffect(() => {
    if (images.length <= 1 || paused || prefersReducedMotion.current) return;
    if (currentIsVideo) return;

    const id = setTimeout(advance, IMAGE_DURATION_MS);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, images.length, paused, currentIsVideo]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden">
        <CoverImage src={null} alt={alt} priority className="h-full w-full" />
      </div>
    );
  }

  if (images.length === 1) {
    return (
      <div className="aspect-[16/9] w-full overflow-hidden">
        <MediaSlide src={images[0]} alt={alt} priority />
      </div>
    );
  }

  function goTo(i: number) {
    setIndex((i + images.length) % images.length);
  }

  return (
    <div
      className="group relative aspect-[16/9] w-full overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <MediaSlide
            src={current}
            alt={alt}
            priority={index === 0}
            paused={paused}
            onEnded={advance}
          />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Elemento precedente"
        className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border-strong bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Elemento successivo"
        className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border-strong bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        →
      </button>

      {/* Sempre visibili (non solo in hover): su mobile l'hover non esiste,
          e servono a far capire a colpo d'occhio che è una galleria. */}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Vai all'elemento ${i + 1}`}
            aria-current={i === index}
            className={`h-1.5 border border-white/50 backdrop-blur-sm transition-all duration-300 ${
              i === index ? "w-6 bg-accent" : "w-1.5 bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

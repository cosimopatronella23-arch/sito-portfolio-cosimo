"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";

const AUTOPLAY_MS = 4000;

/**
 * Copertina progetto: se c'è solo un'immagine, statica come prima. Se ce ne
 * sono altre (galleria), scorre da sola tra tutte, si ferma al passaggio del
 * mouse/focus, e mostra frecce + indicatori per il controllo manuale.
 * Rispetta prefers-reduced-motion (niente autoplay, solo controlli manuali).
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

  useEffect(() => {
    if (images.length <= 1 || paused || prefersReducedMotion.current) return;

    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, AUTOPLAY_MS);

    return () => clearInterval(id);
  }, [images.length, paused]);

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
        <CoverImage src={images[0]} alt={alt} priority className="h-full w-full" />
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
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <CoverImage
            src={images[index]}
            alt={alt}
            priority={index === 0}
            className="h-full w-full"
          />
        </motion.div>
      </AnimatePresence>

      <button
        type="button"
        onClick={() => goTo(index - 1)}
        aria-label="Immagine precedente"
        className="absolute top-1/2 left-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border-strong bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        ←
      </button>
      <button
        type="button"
        onClick={() => goTo(index + 1)}
        aria-label="Immagine successiva"
        className="absolute top-1/2 right-3 flex h-10 w-10 -translate-y-1/2 items-center justify-center border border-border-strong bg-background/70 text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100"
      >
        →
      </button>

      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Vai all'immagine ${i + 1}`}
            aria-current={i === index}
            className={`h-2 w-2 transition-colors ${
              i === index
                ? "bg-accent"
                : "border border-border-strong bg-background/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

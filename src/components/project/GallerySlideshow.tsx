"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useReducedMotion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import type { GalleryItem } from "@/lib/types";
import { DEFAULT_SLIDE_MS } from "@/lib/slideSpeed";

/**
 * Più immagini nello stesso riquadro che si alternano da sole, con una
 * dissolvenza: utile quando le tavole sono tante e affiancarle le
 * renderebbe troppo piccole. Gira come una gif finché è sullo schermo; si
 * ferma solo con il tasto pausa (e con "riduci movimento"). Sotto:
 * contatore e un quadratino per immagine, per saltare a quella.
 */
export function GallerySlideshow({
  items,
  alt,
}: {
  items: GalleryItem[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [userPaused, setUserPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.2 },
    );
    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  const playing = visible && !userPaused && !reduceMotion;
  // Ritmo scelto in admin per questo progetto (predefinito molto veloce,
  // effetto gif). La dissolvenza resta sempre più corta del cambio, così
  // anche alla velocità massima ogni immagine si vede netta.
  const intervalMs = items[0]?.interval ?? DEFAULT_SLIDE_MS;
  const fadeMs = Math.min(300, Math.round(intervalMs * 0.3));

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => setActive((i) => (i + 1) % items.length),
      intervalMs,
    );
    return () => window.clearTimeout(timer);
  }, [playing, active, items.length, intervalMs]);

  // Aspetto da gif: nessun contatore né comandi visibili. Resta comunque
  // fermabile (WCAG 2.2.2): clic o tocco sull'immagine mette in pausa e
  // riprende; da tastiera il pulsante compare solo quando riceve il focus.
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="sequenza di immagini"
      aria-label={alt}
      className="relative aspect-[3/2] w-full overflow-hidden bg-surface"
      onClick={() => setUserPaused((p) => !p)}
    >
      {items.map((item, i) => (
        <div
          key={item.url}
          aria-hidden={i !== active}
          style={{ transitionDuration: `${fadeMs}ms` }}
          className={clsx(
            "absolute inset-0 transition-opacity ease-out motion-reduce:transition-none",
            i === active ? "opacity-100" : "opacity-0",
          )}
        >
          <CoverImage
            src={item.url}
            alt={item.alt || alt}
            sizes="100vw"
            className="h-full w-full"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setUserPaused((p) => !p);
        }}
        aria-label={
          userPaused ? "Riprendi la sequenza" : "Metti in pausa la sequenza"
        }
        className="absolute right-3 bottom-3 flex size-11 items-center justify-center border border-foreground bg-background text-foreground opacity-0 focus-visible:opacity-100"
      >
        {userPaused ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="size-3 fill-current"
          >
            <path d="M3 1.5v9l7-4.5z" />
          </svg>
        ) : (
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="size-3 fill-current"
          >
            <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

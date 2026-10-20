"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { useReducedMotion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import type { GalleryItem } from "@/lib/types";

// Ritmo da gif: abbastanza veloce da sembrare un'animazione, abbastanza
// lento da far leggere ogni tavola.
const INTERVAL_MS = 1800;

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

  useEffect(() => {
    if (!playing) return;
    const timer = window.setTimeout(
      () => setActive((i) => (i + 1) % items.length),
      INTERVAL_MS,
    );
    return () => window.clearTimeout(timer);
  }, [playing, active, items.length]);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="sequenza di immagini"
      aria-label={alt}
      className="flex flex-col gap-3"
    >
      <div className="relative aspect-[3/2] w-full overflow-hidden bg-surface">
        {items.map((item, i) => (
          <div
            key={item.url}
            aria-hidden={i !== active}
            className={clsx(
              "absolute inset-0 transition-opacity duration-300 ease-out motion-reduce:transition-none",
              i === active ? "opacity-100" : "opacity-0",
            )}
          >
            <CoverImage
              src={item.url}
              alt={item.alt || alt}
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="h-full w-full"
            />
          </div>
        ))}
      </div>

      <div className="container-px flex items-center justify-between gap-4">
        <span className="font-display text-sm font-semibold text-foreground-muted tabular-nums">
          {pad(active + 1)} / {pad(items.length)}
        </span>
        <div className="flex items-center gap-2">
          {items.map((item, i) => (
            <button
              key={item.url}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Mostra immagine ${i + 1} di ${items.length}`}
              aria-current={i === active ? "true" : undefined}
              className="group flex size-6 items-center justify-center"
            >
              <span
                className={clsx(
                  "size-2 transition-[transform,background-color] duration-300 group-hover:scale-125",
                  i === active ? "bg-foreground" : "bg-border-strong",
                )}
              />
            </button>
          ))}
          <button
            type="button"
            onClick={() => setUserPaused((p) => !p)}
            aria-label={
              userPaused ? "Riprendi la sequenza" : "Metti in pausa la sequenza"
            }
            className="ml-2 flex size-9 items-center justify-center border border-border-strong text-foreground transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
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
      </div>
    </div>
  );
}

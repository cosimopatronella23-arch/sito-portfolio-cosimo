"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type { ReelItem } from "./HeroReel";

/**
 * "Piano inclinato": le copertine dei lavori in colonne, posate su un piano
 * in prospettiva come pagine su un tavolo. Le colonne scorrono lente e
 * all'infinito, in direzioni alternate (animazione CSS, leggera per il
 * telefono); col mouse il piano si inclina appena verso il puntatore.
 *
 * Il muro è decorativo per i lettori di schermo e per la tastiera (i lavori
 * si raggiungono da "Guarda i progetti" e dalla sezione Progetti): col
 * mouse ogni copertina si illumina e apre il suo progetto.
 *
 * Pausa sempre disponibile (WCAG 2.2.2); con "riduci movimento" il muro
 * resta fermo e il piano non segue il mouse. Fuori dallo schermo le
 * animazioni si fermano.
 */

const COLUMNS = 6;
const PER_COLUMN = 5;
// Durata di un giro completo di ogni colonna, in secondi: velocità diverse
// rendono il movimento meno meccanico.
const DURATIONS = [70, 58, 82, 64, 76, 60];

export function HeroWall({ items }: { items: ReelItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [offscreen, setOffscreen] = useState(false);

  // Composizione delle colonne: ogni colonna parte da un lavoro diverso,
  // così le stesse copertine non finiscono mai affiancate.
  const columns = Array.from({ length: COLUMNS }, (_, c) =>
    Array.from({ length: PER_COLUMN }, (_, k) => items[(c * 4 + k * 2) % items.length]),
  );

  // Inclinazione verso il mouse, ammorbidita (solo mouse/trackpad).
  useEffect(() => {
    const plane = planeRef.current;
    if (!plane) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduce.matches) return;
    let tx = 0;
    let ty = 0;
    let x = 0;
    let y = 0;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const tick = () => {
      x += (tx - x) * 0.06;
      y += (ty - y) * 0.06;
      plane.style.setProperty("--tilt-x", x.toFixed(4));
      plane.style.setProperty("--tilt-y", y.toFixed(4));
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  // Fuori dallo schermo le colonne si fermano (niente lavoro inutile).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const io = new IntersectionObserver(([e]) => setOffscreen(!e.isIntersecting));
    io.observe(root);
    return () => io.disconnect();
  }, []);

  const stopped = paused || offscreen;

  return (
    <div ref={rootRef} className="absolute inset-0">
      <div aria-hidden="true" className="hero-wall absolute inset-0 overflow-hidden [perspective:1600px] max-sm:[perspective:900px]">
        <div
          ref={planeRef}
          className={clsx("hero-wall-plane absolute flex", stopped && "is-paused")}
        >
          {columns.map((col, c) => (
            <div key={c} className="hero-wall-col shrink-0" style={{ ["--d" as string]: `${DURATIONS[c % DURATIONS.length]}s` }}>
              {/* Due copie una sotto l'altra: quando la prima è uscita, la
                  seconda è esattamente al suo posto e il giro ricomincia. */}
              <div className={clsx("hero-wall-track flex flex-col", c % 2 === 1 && "is-reverse")}>
                {[...col, ...col].map((item, k) => (
                  <Link
                    key={k}
                    href={`/progetti/${item.slug}`}
                    tabIndex={-1}
                    draggable={false}
                    data-cursor="link"
                    className="hero-wall-card relative block shrink-0 overflow-hidden bg-surface"
                  >
                    <Image
                      src={item.cover}
                      alt=""
                      fill
                      draggable={false}
                      sizes="(min-width: 640px) 240px, 140px"
                      loading={c < 4 && k < 3 ? "eager" : "lazy"}
                      className="object-cover object-top"
                    />
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Velature: il titolo resta leggibile, il muro sfuma nel fondo. */}
      <div aria-hidden="true" className="hero-wall-veil pointer-events-none absolute inset-0" />

      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-label={paused ? "Riprendi il movimento dei lavori" : "Metti in pausa il movimento dei lavori"}
        className="absolute top-24 right-5 z-20 flex size-11 items-center justify-center border border-border-strong bg-background/60 text-foreground backdrop-blur-md transition-colors hover:bg-foreground hover:text-background sm:top-auto sm:right-6 sm:bottom-12"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          {paused ? <path d="M5 3v10l8-5z" fill="currentColor" stroke="none" /> : <path d="M6 3v10M10 3v10" />}
        </svg>
      </button>
    </div>
  );
}

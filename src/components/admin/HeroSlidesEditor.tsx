"use client";

import { useState } from "react";
import type { HeroSlide } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent py-1.5 text-sm text-foreground focus-visible:border-accent focus-visible:outline-none";

const MAX_SLIDES = 12;

/**
 * Slider dei lavori nell'hero: per ogni copertina si sceglie il progetto
 * (titolo e categoria arrivano da lì, il clic apre la sua pagina) e si
 * carica un'immagine verticale 1:2, che nello slider si vede intera.
 */
export function HeroSlidesEditor({
  name,
  defaultValue,
  projects,
}: {
  name: string;
  defaultValue: HeroSlide[];
  projects: { slug: string; title: string }[];
}) {
  const [slides, setSlides] = useState(() =>
    defaultValue.map((s) => ({ ...s, key: crypto.randomUUID() })),
  );

  function update(key: string, patch: Partial<HeroSlide>) {
    setSlides((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function move(index: number, direction: -1 | 1) {
    setSlides((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {slides.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          Nessuna copertina: lo slider usa le copertine dei progetti pubblicati.
        </p>
      ) : null}
      {slides.map((slide, i) => (
        <div
          key={slide.key}
          className="grid grid-cols-1 gap-4 border border-border-strong p-4 sm:grid-cols-[1fr_auto]"
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3 text-xs text-foreground-muted">
              <span className="font-display text-sm text-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Sposta su" className="h-8 w-8 hover:text-foreground disabled:opacity-30">↑</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === slides.length - 1} aria-label="Sposta giù" className="h-8 w-8 hover:text-foreground disabled:opacity-30">↓</button>
                <button type="button" onClick={() => setSlides((prev) => prev.filter((s) => s.key !== slide.key))} className="hover:text-error">Rimuovi</button>
              </span>
            </div>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-foreground-muted">Progetto</span>
              <select
                value={slide.project}
                onChange={(e) => update(slide.key, { project: e.target.value })}
                className={fieldClasses}
              >
                <option value="">Scegli un progetto</option>
                {projects.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
            <ImageUploader
              name={`hero_slide_cover_${slide.key}`}
              label="Copertina verticale (1:2, es. 900 x 1800 px)"
              defaultValue={slide.cover}
              onChange={(url) => update(slide.key, { cover: url })}
            />
          </div>
          {slide.cover ? (
            // Anteprima nella proporzione dello slider: se l'immagine non è
            // 1:2 qui si vede subito come verrà tagliata.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={slide.cover}
              alt=""
              className="aspect-[1/2] w-24 border border-border-strong object-cover"
            />
          ) : null}
        </div>
      ))}
      {slides.length < MAX_SLIDES ? (
        <button
          type="button"
          onClick={() =>
            setSlides((prev) => [...prev, { project: "", cover: "", key: crypto.randomUUID() }])
          }
          className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
        >
          + Aggiungi copertina
        </button>
      ) : null}
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          slides
            .filter((s) => s.project && s.cover)
            .map(({ project, cover }) => ({ project, cover })),
        )}
      />
    </div>
  );
}

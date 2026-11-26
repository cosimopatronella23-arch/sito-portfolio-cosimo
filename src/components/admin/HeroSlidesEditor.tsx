"use client";

import { useState } from "react";
import clsx from "clsx";
import type { HeroSlide } from "@/lib/types";
import { ImageUploader } from "./ImageUploader";
import { AdminIcon } from "./AdminIcons";

const MAX_SLIDES = 12;

type Item = HeroSlide & { key: string };

/**
 * Copertine del muro dell'hero come miniature: si trascinano per
 * cambiare ordine (o si spostano con i pulsanti, anche da tastiera), un
 * clic apre i dettagli sotto (progetto collegato, immagine, rimuovi).
 * Le immagini vanno verticali 1:2: la miniatura mostra subito il taglio.
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
  const [slides, setSlides] = useState<Item[]>(() =>
    defaultValue.map((s) => ({ ...s, key: crypto.randomUUID() })),
  );
  const [selected, setSelected] = useState<string | null>(slides[0]?.key ?? null);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const current = slides.find((s) => s.key === selected) ?? null;
  const currentIndex = current ? slides.indexOf(current) : -1;
  const titleOf = (slug: string) => projects.find((p) => p.slug === slug)?.title ?? "";

  function update(key: string, patch: Partial<HeroSlide>) {
    setSlides((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function moveTo(key: string, target: number) {
    setSlides((prev) => {
      const from = prev.findIndex((s) => s.key === key);
      if (from < 0 || target < 0 || target >= prev.length || from === target) return prev;
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(target, 0, item);
      return next;
    });
  }

  function add() {
    const item: Item = { project: "", cover: "", key: crypto.randomUUID() };
    setSlides((prev) => [...prev, item]);
    setSelected(item.key);
  }

  function remove(key: string) {
    setSlides((prev) => prev.filter((s) => s.key !== key));
    setSelected((prev) => (prev === key ? null : prev));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">Copertine del muro</span>
        <span className="text-xs text-foreground-muted">trascina per riordinare</span>
      </div>

      <ul className="grid grid-cols-5 gap-2" aria-label="Copertine, nell'ordine del muro">
        {slides.map((slide, i) => (
          <li
            key={slide.key}
            draggable
            onDragStart={() => setDragKey(slide.key)}
            onDragEnd={() => setDragKey(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (dragKey) moveTo(dragKey, i);
              setDragKey(null);
            }}
            className={clsx("cursor-grab active:cursor-grabbing", dragKey === slide.key && "opacity-40")}
          >
            <button
              type="button"
              onClick={() => setSelected(slide.key)}
              aria-pressed={selected === slide.key}
              aria-label={`${i + 1}. ${titleOf(slide.project) || "Copertina senza progetto"}`}
              className={clsx(
                "relative block aspect-[1/2] w-full overflow-hidden border bg-background transition-colors",
                selected === slide.key ? "border-accent outline-2 outline-accent" : "border-border-strong hover:border-foreground",
              )}
            >
              {slide.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={slide.cover} alt="" className="h-full w-full object-cover" draggable={false} />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] text-foreground-muted">
                  Vuota
                </span>
              )}
              {!slide.project || !slide.cover ? (
                <span className="absolute inset-x-0 bottom-0 bg-warning px-1 py-0.5 text-[9px] font-semibold text-ink">
                  Da completare
                </span>
              ) : null}
            </button>
          </li>
        ))}
        {slides.length < MAX_SLIDES ? (
          <li>
            <button
              type="button"
              onClick={add}
              aria-label="Aggiungi una copertina"
              className="flex aspect-[1/2] w-full items-center justify-center border border-dashed border-border-strong text-foreground-muted transition-colors hover:border-accent hover:text-accent"
            >
              <AdminIcon name="plus" className="h-5 w-5" />
            </button>
          </li>
        ) : null}
      </ul>

      {current ? (
        <div key={current.key} className="flex flex-col gap-3 border border-border-strong bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-semibold">
              {currentIndex + 1}. {titleOf(current.project) || "Nuova copertina"}
            </span>
            <span className="flex gap-1">
              <button type="button" onClick={() => moveTo(current.key, currentIndex - 1)} disabled={currentIndex === 0} aria-label="Sposta prima" className="flex size-9 items-center justify-center border border-border-strong disabled:opacity-30">
                <AdminIcon name="back" className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => moveTo(current.key, currentIndex + 1)} disabled={currentIndex === slides.length - 1} aria-label="Sposta dopo" className="flex size-9 items-center justify-center border border-border-strong disabled:opacity-30">
                <AdminIcon name="arrow" className="h-3.5 w-3.5" />
              </button>
              <button type="button" onClick={() => remove(current.key)} className="min-h-9 border border-border-strong px-3 text-xs text-foreground-muted hover:border-error hover:text-error">
                Togli
              </button>
            </span>
          </div>
          <label className="flex flex-col gap-1">
            <span className="text-xs text-foreground-muted">Progetto che si apre al clic</span>
            <select
              value={current.project}
              onChange={(e) => update(current.key, { project: e.target.value })}
              className="min-h-11 border border-border-strong bg-background px-3 text-sm"
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
            name="hero_slide_cover_uploader"
            label="Immagine verticale 1:2 (es. 900 x 1800 px)"
            defaultValue={current.cover}
            onChange={(url) => update(current.key, { cover: url })}
          />
        </div>
      ) : null}

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          slides.filter((s) => s.project && s.cover).map(({ project, cover }) => ({ project, cover })),
        )}
      />
    </div>
  );
}

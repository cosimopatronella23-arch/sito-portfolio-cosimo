"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import type { GalleryItem } from "@/lib/types";

/**
 * Repeater per le immagini/video extra di un progetto (oltre alla
 * copertina), mostrati nella galleria della pagina progetto. Per ognuna si
 * sceglie se occupare l'intera larghezza o stare affiancata a un'altra
 * "affiancata" — vedi ProjectMediaGallery per come viene poi disposta.
 */
export function ProjectGalleryEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: GalleryItem[];
}) {
  const [items, setItems] = useState<GalleryItem[]>(defaultValue);

  function update(index: number, patch: Partial<GalleryItem>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    );
  }

  function add() {
    setItems((prev) => [...prev, { url: "", layout: "full" }]);
  }

  function remove(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground-muted">
        Foto o brevi video (MP4/WebM) aggiuntivi, mostrati nella galleria
        della pagina del progetto. I video partono in automatico, senza
        audio, in loop. Per ognuno scegli se mostrarlo a tutta larghezza o
        affiancato a un altro.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={i} className="flex flex-col gap-2">
            <ImageUploader
              name={`project-gallery-${i}`}
              label={`Immagine o video ${i + 1}`}
              defaultValue={item.url}
              onChange={(url) => update(i, { url })}
              accept="image/*,video/mp4,video/webm"
            />
            <div className="flex items-center gap-4 text-sm">
              <span className="text-foreground-muted">Layout:</span>
              {(["full", "half"] as const).map((layout) => (
                <label key={layout} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={`gallery-layout-${i}`}
                    checked={item.layout === layout}
                    onChange={() => update(i, { layout })}
                  />
                  {layout === "full" ? "Intera" : "Affiancata"}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-max text-xs text-foreground-muted hover:text-error"
            >
              Rimuovi
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi immagine
      </button>
      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

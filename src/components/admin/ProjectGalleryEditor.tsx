"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";

/**
 * Repeater per le immagini extra di un progetto (oltre alla copertina),
 * mostrate come galleria/carosello nella pagina pubblica del progetto.
 */
export function ProjectGalleryEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: string[];
}) {
  const [images, setImages] = useState<string[]>(defaultValue);

  function update(index: number, url: string) {
    setImages((prev) => prev.map((img, i) => (i === index ? url : img)));
  }

  function add() {
    setImages((prev) => [...prev, ""]);
  }

  function remove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground-muted">
        Foto o brevi video (MP4/WebM) aggiuntivi, mostrati a scorrimento
        automatico dopo la copertina nella pagina del progetto. I video
        partono in automatico, senza audio, in loop.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <div key={i} className="flex flex-col gap-2">
            <ImageUploader
              name={`project-gallery-${i}`}
              label={`Immagine o video ${i + 1}`}
              defaultValue={img}
              onChange={(url) => update(i, url)}
              accept="image/*,video/mp4,video/webm"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-max text-xs text-foreground-muted hover:text-error"
            >
              Rimuovi immagine
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
      <input type="hidden" name={name} value={JSON.stringify(images)} />
    </div>
  );
}

"use client";

import { useState } from "react";
import { ImageUploader } from "./ImageUploader";
import type { GalleryItem } from "@/lib/types";

// Chiave stabile solo per React, mai salvata: ImageUploader inizializza il
// proprio stato (url caricato) una sola volta al montaggio, non lo
// risincronizza da solo se cambiano le props. Usare l'indice dell'array come
// key avrebbe fatto sì che, rimuovendo un elemento in mezzo, quelli dopo
// riciclassero l'istanza dell'uploader dell'elemento rimosso — mostrando (e
// salvando) l'url sbagliato invece del proprio.
type EditableItem = GalleryItem & { key: string };

function withKeys(items: GalleryItem[]): EditableItem[] {
  return items.map((item) => ({ ...item, key: crypto.randomUUID() }));
}

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
  const [items, setItems] = useState<EditableItem[]>(() =>
    withKeys(defaultValue),
  );

  function update(key: string, patch: Partial<GalleryItem>) {
    setItems((prev) =>
      prev.map((item) => (item.key === key ? { ...item, ...patch } : item)),
    );
  }

  function add() {
    setItems((prev) => [
      ...prev,
      { url: "", layout: "full", key: crypto.randomUUID() },
    ]);
  }

  function remove(key: string) {
    setItems((prev) => prev.filter((item) => item.key !== key));
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-foreground-muted">
        Foto o brevi video aggiuntivi, mostrati nella galleria della pagina
        del progetto. Per i video usa sempre <strong>MP4</strong>: è l&apos;
        unico formato che funziona su tutti i browser, incluso Safari su
        Mac e iPhone (il WebM su Safari spesso non si vede). I video
        partono in automatico, senza audio, in loop. Per ognuno scegli se
        mostrarlo a tutta larghezza o affiancato a un altro.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {items.map((item, i) => (
          <div key={item.key} className="flex flex-col gap-2">
            <ImageUploader
              name={`project-gallery-${item.key}`}
              label={`Immagine o video ${i + 1}`}
              defaultValue={item.url}
              onChange={(url) => update(item.key, { url })}
              accept="image/*,video/mp4,video/webm"
            />
            <div className="flex items-center gap-4 text-sm">
              <span className="text-foreground-muted">Layout:</span>
              {(["full", "half"] as const).map((layout) => (
                <label key={layout} className="flex items-center gap-1.5">
                  <input
                    type="radio"
                    name={`gallery-layout-${item.key}`}
                    checked={item.layout === layout}
                    onChange={() => update(item.key, { layout })}
                  />
                  {layout === "full" ? "Intera" : "Affiancata"}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={() => remove(item.key)}
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
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(items.map(({ url, layout }) => ({ url, layout })))}
      />
    </div>
  );
}

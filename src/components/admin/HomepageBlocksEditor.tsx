"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import { ImageUploader } from "./ImageUploader";
import type { HomepageBlock, TestimonialItem } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

const BLOCK_LABELS: Record<HomepageBlock["type"], string> = {
  testo_libero: "Testo libero",
  hero_alt: "Hero alternativo",
  testimonianze: "Testimonianze",
  cta_banner: "CTA banner",
  gallery: "Gallery",
};

function emptyBlock(type: HomepageBlock["type"]): HomepageBlock {
  const id = crypto.randomUUID();
  switch (type) {
    case "testo_libero":
      return {
        id,
        type,
        data: { title: "", body: "", ctaLabel: "", ctaHref: "", align: "left" },
      };
    case "hero_alt":
      return {
        id,
        type,
        data: { title: "", subtitle: "", ctaLabel: "", ctaHref: "", align: "left" },
      };
    case "cta_banner":
      return {
        id,
        type,
        data: { title: "", subtitle: "", ctaLabel: "", ctaHref: "", align: "left" },
      };
    case "testimonianze":
      return { id, type, data: { title: "", items: [], align: "left" } };
    case "gallery":
      return { id, type, data: { title: "", images: [], align: "left" } };
  }
}

/**
 * Sistema di blocchi homepage: repeater che permette di
 * aggiungere/riordinare/configurare sezioni extra, in coda alla homepage
 * (prima dei Contatti). Il tipo di un blocco si sceglie alla creazione e non
 * cambia più — evita di dover "convertire" dati tra forme diverse.
 */
export function HomepageBlocksEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: HomepageBlock[];
}) {
  const [blocks, setBlocks] = useState<HomepageBlock[]>(defaultValue);

  function addBlock(type: HomepageBlock["type"]) {
    setBlocks((prev) => [...prev, emptyBlock(type)]);
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateData(index: number, patch: Record<string, unknown>) {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i === index
          ? ({ ...b, data: { ...b.data, ...patch } } as HomepageBlock)
          : b,
      ),
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          Nessun blocco extra ancora. Aggiungine uno per iniziare a comporre
          contenuti oltre alle sezioni fisse della homepage.
        </p>
      ) : null}

      {blocks.map((block, i) => (
        <div
          key={block.id}
          className="flex flex-col gap-4 border border-border-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium">
              {BLOCK_LABELS[block.type]}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => moveBlock(i, -1)}
                disabled={i === 0}
                className="text-foreground-muted hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(i, 1)}
                disabled={i === blocks.length - 1}
                className="text-foreground-muted hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(i)}
                className="text-foreground-muted hover:text-error"
              >
                Rimuovi
              </button>
            </div>
          </div>

          <input
            type="text"
            value={block.data.title}
            onChange={(e) => updateData(i, { title: e.target.value })}
            placeholder="Titolo"
            className={fieldClasses}
          />

          <div className="flex items-center gap-4 text-sm">
            <span className="text-foreground-muted">Allineamento:</span>
            {(["left", "center"] as const).map((align) => (
              <label key={align} className="flex items-center gap-1.5">
                <input
                  type="radio"
                  name={`align-${block.id}`}
                  checked={(block.data.align ?? "left") === align}
                  onChange={() => updateData(i, { align })}
                />
                {align === "left" ? "Sinistra" : "Centro"}
              </label>
            ))}
          </div>

          {block.type === "testo_libero" ? (
            <>
              <span className="text-sm text-foreground-muted">Testo</span>
              <RichTextEditor
                name={`block-body-${block.id}`}
                defaultValue={block.data.body}
                onChange={(html) => updateData(i, { body: html })}
              />
            </>
          ) : null}

          {block.type === "hero_alt" || block.type === "cta_banner" ? (
            <textarea
              value={block.data.subtitle}
              onChange={(e) => updateData(i, { subtitle: e.target.value })}
              placeholder="Sottotitolo"
              rows={2}
              className={fieldClasses}
            />
          ) : null}

          {block.type === "testo_libero" ||
          block.type === "hero_alt" ||
          block.type === "cta_banner" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={block.data.ctaLabel}
                onChange={(e) => updateData(i, { ctaLabel: e.target.value })}
                placeholder="Testo bottone (opzionale)"
                className={fieldClasses}
              />
              <input
                type="text"
                value={block.data.ctaHref}
                onChange={(e) => updateData(i, { ctaHref: e.target.value })}
                placeholder="Link bottone (es. /#contatti)"
                className={fieldClasses}
              />
            </div>
          ) : null}

          {block.type === "testimonianze" ? (
            <TestimonialsFields
              items={block.data.items}
              onChange={(items) => updateData(i, { items })}
            />
          ) : null}

          {block.type === "gallery" ? (
            <GalleryFields
              images={block.data.images}
              onChange={(images) => updateData(i, { images })}
            />
          ) : null}
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        {(
          [
            ["testo_libero", "+ Testo libero"],
            ["hero_alt", "+ Hero alternativo"],
            ["testimonianze", "+ Testimonianze"],
            ["cta_banner", "+ CTA banner"],
            ["gallery", "+ Gallery"],
          ] as const
        ).map(([type, label]) => (
          <button
            key={type}
            type="button"
            onClick={() => addBlock(type)}
            className="border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
          >
            {label}
          </button>
        ))}
      </div>

      <input type="hidden" name={name} value={JSON.stringify(blocks)} />
    </div>
  );
}

function TestimonialsFields({
  items,
  onChange,
}: {
  items: TestimonialItem[];
  onChange: (items: TestimonialItem[]) => void;
}) {
  function update(index: number, field: keyof TestimonialItem, value: string) {
    onChange(
      items.map((it, i) => (i === index ? { ...it, [field]: value } : it)),
    );
  }

  function add() {
    onChange([...items, { quote: "", author: "", role: "" }]);
  }

  function remove(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-foreground-muted">Citazioni</span>
      {items.map((item, i) => (
        <div key={i} className="flex flex-col gap-2 border border-border p-3">
          <textarea
            value={item.quote}
            onChange={(e) => update(i, "quote", e.target.value)}
            placeholder="Citazione"
            rows={2}
            className={fieldClasses}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={item.author}
              onChange={(e) => update(i, "author", e.target.value)}
              placeholder="Nome"
              className={fieldClasses}
            />
            <input
              type="text"
              value={item.role}
              onChange={(e) => update(i, "role", e.target.value)}
              placeholder="Ruolo/azienda (opzionale)"
              className={fieldClasses}
            />
          </div>
          <button
            type="button"
            onClick={() => remove(i)}
            className="w-max text-xs text-foreground-muted hover:text-error"
          >
            Rimuovi citazione
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="w-max border border-border-strong px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi citazione
      </button>
    </div>
  );
}

function GalleryFields({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  function update(index: number, url: string) {
    onChange(images.map((img, i) => (i === index ? url : img)));
  }

  function add() {
    onChange([...images, ""]);
  }

  function remove(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm text-foreground-muted">Immagini</span>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.map((img, i) => (
          <div key={i} className="flex flex-col gap-2">
            <ImageUploader
              name={`gallery-image-${i}`}
              label={`Immagine ${i + 1}`}
              defaultValue={img}
              onChange={(url) => update(i, url)}
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
        className="w-max border border-border-strong px-3 py-1.5 text-xs text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi immagine
      </button>
    </div>
  );
}

"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import type { HomepageBlock } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent px-0 py-2 text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

const BLOCK_LABELS: Record<HomepageBlock["type"], string> = {
  testo_libero: "Testo libero",
  hero_alt: "Hero alternativo",
};

function emptyBlock(type: HomepageBlock["type"]): HomepageBlock {
  const id = crypto.randomUUID();
  if (type === "testo_libero") {
    return {
      id,
      type,
      data: { title: "", body: "", ctaLabel: "", ctaHref: "", align: "left" },
    };
  }
  return {
    id,
    type,
    data: {
      title: "",
      subtitle: "",
      ctaLabel: "",
      ctaHref: "",
      align: "left",
    },
  };
}

/**
 * Fase A del sistema di blocchi homepage: repeater che permette di
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

  function updateData(index: number, patch: Record<string, string>) {
    setBlocks((prev) =>
      prev.map((b, i) =>
        i === index ? ({ ...b, data: { ...b.data, ...patch } } as HomepageBlock) : b,
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
          ) : (
            <textarea
              value={block.data.subtitle}
              onChange={(e) => updateData(i, { subtitle: e.target.value })}
              placeholder="Sottotitolo"
              rows={2}
              className={fieldClasses}
            />
          )}

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
        </div>
      ))}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => addBlock("testo_libero")}
          className="border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
        >
          + Blocco Testo libero
        </button>
        <button
          type="button"
          onClick={() => addBlock("hero_alt")}
          className="border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
        >
          + Blocco Hero alternativo
        </button>
      </div>

      <input type="hidden" name={name} value={JSON.stringify(blocks)} />
    </div>
  );
}

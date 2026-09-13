"use client";

import { useState } from "react";
import { RichTextEditor } from "./RichTextEditor";
import type { ContentBlock } from "@/lib/types";

// Chiave stabile solo per React, mai salvata: l'editor di testo ricco
// inizializza il proprio contenuto una sola volta al montaggio (non lo
// risincronizza da solo se cambiano le props). Usare l'indice dell'array
// come key avrebbe fatto sì che, rimuovendo una sezione in mezzo, quelle
// sotto mostrassero temporaneamente il testo sbagliato — riciclando
// l'istanza dell'editor della sezione rimossa per quella successiva.
type EditableBlock = ContentBlock & { key: string };

function withKeys(blocks: ContentBlock[]): EditableBlock[] {
  return blocks.map((b) => ({ ...b, key: crypto.randomUUID() }));
}

/**
 * Ripetitore per le sezioni "Il problema / La soluzione / Risultati" di un
 * progetto. Serializza tutto in un input nascosto "content_blocks" (JSON),
 * letto dalla Server Action al submit del form.
 */
export function ContentBlocksEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: ContentBlock[];
}) {
  const [blocks, setBlocks] = useState<EditableBlock[]>(() =>
    withKeys(defaultValue.length > 0 ? defaultValue : [{ heading: "", body: "" }]),
  );

  function updateBlock(key: string, field: keyof ContentBlock, value: string) {
    setBlocks((prev) =>
      prev.map((b) => (b.key === key ? { ...b, [field]: value } : b)),
    );
  }

  function addBlock() {
    setBlocks((prev) => [
      ...prev,
      { heading: "", body: "", key: crypto.randomUUID() },
    ]);
  }

  function removeBlock(key: string) {
    setBlocks((prev) => prev.filter((b) => b.key !== key));
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block) => (
        <div
          key={block.key}
          className="flex flex-col gap-2 border border-border-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={block.heading}
              onChange={(e) =>
                updateBlock(block.key, "heading", e.target.value)
              }
              placeholder="Titolo sezione (es. Il problema)"
              className="w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm font-medium text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => removeBlock(block.key)}
              className="shrink-0 text-xs text-foreground-muted hover:text-error"
            >
              Rimuovi
            </button>
          </div>
          <RichTextEditor
            name={`content-block-${block.key}-body`}
            defaultValue={block.body}
            onChange={(html) => updateBlock(block.key, "body", html)}
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addBlock}
        className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi sezione
      </button>

      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          blocks.map(({ heading, body }) => ({ heading, body })),
        )}
      />
    </div>
  );
}

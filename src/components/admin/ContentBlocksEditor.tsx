"use client";

import { useState } from "react";
import type { ContentBlock } from "@/lib/types";

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
  const [blocks, setBlocks] = useState<ContentBlock[]>(
    defaultValue.length > 0 ? defaultValue : [{ heading: "", body: "" }],
  );

  function updateBlock(
    index: number,
    field: keyof ContentBlock,
    value: string,
  ) {
    setBlocks((prev) =>
      prev.map((b, i) => (i === index ? { ...b, [field]: value } : b)),
    );
  }

  function addBlock() {
    setBlocks((prev) => [...prev, { heading: "", body: "" }]);
  }

  function removeBlock(index: number) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      {blocks.map((block, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border border-border-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <input
              type="text"
              value={block.heading}
              onChange={(e) => updateBlock(i, "heading", e.target.value)}
              placeholder="Titolo sezione (es. Il problema)"
              className="w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm font-medium text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
            />
            <button
              type="button"
              onClick={() => removeBlock(i)}
              className="shrink-0 text-xs text-foreground-muted hover:text-error"
            >
              Rimuovi
            </button>
          </div>
          <textarea
            value={block.body}
            onChange={(e) => updateBlock(i, "body", e.target.value)}
            rows={3}
            placeholder="Testo della sezione"
            className="w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
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

      <input type="hidden" name={name} value={JSON.stringify(blocks)} />
    </div>
  );
}

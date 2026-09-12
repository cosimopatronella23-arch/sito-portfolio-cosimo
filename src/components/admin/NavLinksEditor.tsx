"use client";

import { useState } from "react";
import type { NavLink } from "@/lib/types";

/**
 * Ripetitore per i link del menu di navigazione. Stesso pattern di
 * ServicesEditor: serializza in un input nascosto "nav_links" (JSON), letto
 * dalla Server Action al submit. Se lasciato vuoto, il sito usa i link di
 * default già presenti nel codice (nessuna homepage senza menu per errore).
 */
export function NavLinksEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: NavLink[];
}) {
  const [links, setLinks] = useState<NavLink[]>(defaultValue);

  function updateLink(index: number, field: keyof NavLink, value: string) {
    setLinks((prev) =>
      prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)),
    );
  }

  function addLink() {
    setLinks((prev) => [...prev, { label: "", href: "" }]);
  }

  function removeLink(index: number) {
    setLinks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveLink(index: number, direction: -1 | 1) {
    setLinks((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {links.length === 0 ? (
        <p className="text-sm text-foreground-muted">
          Vuoto = usa il menu attuale del sito. Aggiungi voci qui solo se
          vuoi sostituirlo.
        </p>
      ) : null}

      {links.map((link, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border border-border-strong p-4 sm:flex-row sm:items-center"
        >
          <input
            type="text"
            value={link.label}
            onChange={(e) => updateLink(i, "label", e.target.value)}
            placeholder="Etichetta (es. Blog)"
            className="w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm font-medium text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none sm:w-1/3"
          />
          <input
            type="text"
            value={link.href}
            onChange={(e) => updateLink(i, "href", e.target.value)}
            placeholder="Link (es. /blog o /#servizi)"
            className="w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
          />
          <div className="flex items-center gap-3 text-xs">
            <button
              type="button"
              onClick={() => moveLink(i, -1)}
              disabled={i === 0}
              className="text-foreground-muted hover:text-foreground disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => moveLink(i, 1)}
              disabled={i === links.length - 1}
              className="text-foreground-muted hover:text-foreground disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => removeLink(i)}
              className="text-foreground-muted hover:text-error"
            >
              Rimuovi
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addLink}
        className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi voce di menu
      </button>

      <input type="hidden" name={name} value={JSON.stringify(links)} />
    </div>
  );
}

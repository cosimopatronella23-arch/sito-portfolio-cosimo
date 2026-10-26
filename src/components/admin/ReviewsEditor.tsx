"use client";

import { useState } from "react";
import type { ClientReview } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

function emptyReview(): ClientReview {
  return {
    id: crypto.randomUUID(),
    author: "",
    context: "",
    text: "",
    rating: 5,
    date: new Date().toISOString().slice(0, 7),
    project_slug: "",
    visible: true,
  };
}

/**
 * Elenco delle recensioni: si incollano da Google (nome, testo, stelle) e
 * compaiono sul sito nello stile del sito. Serializza in un campo nascosto
 * letto dalla Server Action.
 */
export function ReviewsEditor({
  name,
  defaultValue,
  projects,
}: {
  name: string;
  defaultValue: ClientReview[];
  projects: { slug: string; title: string }[];
}) {
  const [items, setItems] = useState(defaultValue);

  function update(id: string, patch: Partial<ClientReview>) {
    setItems((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function move(index: number, direction: -1 | 1) {
    setItems((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {items.length === 0 ? (
        <p className="border border-border px-5 py-8 text-center text-sm text-foreground-muted">
          Nessuna recensione ancora. Quando un cliente ne lascia una su Google,
          aggiungila qui: sul sito la sezione compare da sola.
        </p>
      ) : null}

      {items.map((review, i) => (
        <fieldset
          key={review.id}
          className="flex flex-col gap-4 border border-border-strong bg-surface p-4 sm:p-5"
        >
          <legend className="sr-only">Recensione {i + 1}</legend>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-medium">
              {review.author || `Recensione ${i + 1}`}
            </span>
            <span className="flex items-center gap-3 text-foreground-muted">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={review.visible}
                  onChange={(e) => update(review.id, { visible: e.target.checked })}
                />
                Visibile sul sito
              </label>
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label="Sposta su"
                className="flex h-8 w-8 items-center justify-center hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                aria-label="Sposta giù"
                className="flex h-8 w-8 items-center justify-center hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm("Togliere questa recensione dal sito?")) {
                    setItems((prev) => prev.filter((r) => r.id !== review.id));
                  }
                }}
                className="hover:text-error"
              >
                Rimuovi
              </button>
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-sm">
              Nome di chi l&apos;ha scritta
              <input
                value={review.author}
                onChange={(e) => update(review.id, { author: e.target.value })}
                placeholder="es. Brenda Pretorius"
                className={fieldClasses}
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Ruolo o progetto (facoltativo)
              <input
                value={review.context}
                onChange={(e) => update(review.id, { context: e.target.value })}
                placeholder="es. Cantautrice e vocal coach"
                className={fieldClasses}
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-sm">
            Testo della recensione (copialo da Google così com&apos;è)
            <textarea
              value={review.text}
              onChange={(e) => update(review.id, { text: e.target.value })}
              rows={4}
              className={fieldClasses}
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-1 text-sm">
              Stelle
              <select
                value={review.rating}
                onChange={(e) => update(review.id, { rating: Number(e.target.value) })}
                className="min-h-10 border border-border-strong bg-background px-2"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} su 5
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Mese
              <input
                type="month"
                value={review.date}
                onChange={(e) => update(review.id, { date: e.target.value })}
                className="min-h-10 border border-border-strong bg-background px-2"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              Progetto collegato (facoltativo)
              <select
                value={review.project_slug}
                onChange={(e) => update(review.id, { project_slug: e.target.value })}
                className="min-h-10 border border-border-strong bg-background px-2"
              >
                <option value="">Nessuno</option>
                {projects.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </label>
          </div>
          {review.project_slug ? (
            <div className="flex flex-col gap-2 text-sm">
              <span>
                Mostrala anche nei progetti{" "}
                <span className="text-foreground-muted">
                  (se il cliente parla di più lavori)
                </span>
              </span>
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                {projects
                  .filter((p) => p.slug !== review.project_slug)
                  .map((p) => {
                    const also = review.also_project_slugs ?? [];
                    return (
                      <label key={p.slug} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={also.includes(p.slug)}
                          onChange={(e) =>
                            update(review.id, {
                              also_project_slugs: e.target.checked
                                ? [...also, p.slug]
                                : also.filter((s) => s !== p.slug),
                            })
                          }
                        />
                        {p.title}
                      </label>
                    );
                  })}
              </div>
            </div>
          ) : null}
        </fieldset>
      ))}

      <button
        type="button"
        onClick={() => setItems((prev) => [...prev, emptyReview()])}
        className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi recensione
      </button>

      <input type="hidden" name={name} value={JSON.stringify(items)} />
    </div>
  );
}

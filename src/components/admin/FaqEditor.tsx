"use client";

import { useState } from "react";
import type { ServiceFaq } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

/**
 * Domande frequenti di un servizio: domanda + risposta, riordinabili.
 * Serializza in un input nascosto (JSON) letto dalla Server Action.
 */
export function FaqEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: ServiceFaq[];
}) {
  const [items, setItems] = useState(() =>
    defaultValue.map((f) => ({ ...f, key: crypto.randomUUID() })),
  );

  function update(key: string, field: keyof ServiceFaq, value: string) {
    setItems((prev) =>
      prev.map((f) => (f.key === key ? { ...f, [field]: value } : f)),
    );
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
        <p className="text-sm text-foreground-muted">
          Nessuna domanda. Aggiungine 3-4 tra quelle che ti fanno davvero i
          clienti.
        </p>
      ) : null}
      {items.map((faq, i) => (
        <div
          key={faq.key}
          className="flex flex-col gap-2 border border-border-strong p-4"
        >
          <div className="flex items-center justify-end gap-3 text-xs">
            <button
              type="button"
              onClick={() => move(i, -1)}
              disabled={i === 0}
              aria-label="Sposta su"
              className="text-foreground-muted hover:text-foreground disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => move(i, 1)}
              disabled={i === items.length - 1}
              aria-label="Sposta giù"
              className="text-foreground-muted hover:text-foreground disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() =>
                setItems((prev) => prev.filter((f) => f.key !== faq.key))
              }
              className="text-foreground-muted hover:text-error"
            >
              Rimuovi
            </button>
          </div>
          <input
            type="text"
            value={faq.question}
            onChange={(e) => update(faq.key, "question", e.target.value)}
            placeholder="Domanda (es. Quanto tempo serve per un sito?)"
            className={`${fieldClasses} font-medium`}
          />
          <textarea
            value={faq.answer}
            onChange={(e) => update(faq.key, "answer", e.target.value)}
            placeholder="Risposta"
            rows={3}
            className={fieldClasses}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() =>
          setItems((prev) => [
            ...prev,
            { question: "", answer: "", key: crypto.randomUUID() },
          ])
        }
        className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi domanda
      </button>
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(
          items.map(({ question, answer }) => ({ question, answer })),
        )}
      />
    </div>
  );
}

"use client";

import { useState } from "react";
import type { ProcessStep } from "@/lib/types";

const fieldClasses =
  "w-full border-0 border-b border-border-strong bg-transparent py-1.5 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

/** Passi della sezione "Come lavoro" (massimo 6), riordinabili. */
export function ProcessStepsEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue: ProcessStep[];
}) {
  const [steps, setSteps] = useState(() =>
    defaultValue.map((s) => ({ ...s, key: crypto.randomUUID() })),
  );

  function update(key: string, patch: Partial<ProcessStep>) {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }

  function move(index: number, direction: -1 | 1) {
    setSteps((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {steps.map((step, i) => (
        <div key={step.key} className="flex flex-col gap-2 border border-border-strong p-4">
          <div className="flex items-center justify-between gap-3 text-xs text-foreground-muted">
            <span className="font-display text-sm text-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="flex items-center gap-2">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Sposta su" className="h-8 w-8 hover:text-foreground disabled:opacity-30">↑</button>
              <button type="button" onClick={() => move(i, 1)} disabled={i === steps.length - 1} aria-label="Sposta giù" className="h-8 w-8 hover:text-foreground disabled:opacity-30">↓</button>
              <button type="button" onClick={() => setSteps((prev) => prev.filter((s) => s.key !== step.key))} className="hover:text-error">Rimuovi</button>
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_10rem]">
            <input value={step.title} onChange={(e) => update(step.key, { title: e.target.value })} placeholder="Titolo (es. Consulenza)" className={`${fieldClasses} font-medium`} />
            <input value={step.badge} onChange={(e) => update(step.key, { badge: e.target.value })} placeholder="Etichetta (es. Gratis)" className={fieldClasses} />
          </div>
          <textarea value={step.text} onChange={(e) => update(step.key, { text: e.target.value })} placeholder="Descrizione breve" rows={2} className={fieldClasses} />
        </div>
      ))}
      {steps.length < 6 ? (
        <button
          type="button"
          onClick={() => setSteps((prev) => [...prev, { title: "", text: "", badge: "", key: crypto.randomUUID() }])}
          className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
        >
          + Aggiungi passo
        </button>
      ) : null}
      <input
        type="hidden"
        name={name}
        value={JSON.stringify(steps.map(({ title, text, badge }) => ({ title, text, badge })))}
      />
    </div>
  );
}

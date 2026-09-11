"use client";

import { useState } from "react";
import type { ServiceItem } from "@/lib/types";

/**
 * Ripetitore per la lista dei servizi in homepage (i numeri 01/02/03... si
 * generano da soli in base alla posizione). Serializza in un input nascosto
 * "services" (JSON), letto dalla Server Action al submit.
 */
export function ServicesEditor({
  name,
  defaultValue = [],
}: {
  name: string;
  defaultValue?: ServiceItem[];
}) {
  const [services, setServices] = useState<ServiceItem[]>(
    defaultValue.length > 0 ? defaultValue : [{ title: "", description: "" }],
  );

  function updateService(
    index: number,
    field: keyof ServiceItem,
    value: string,
  ) {
    setServices((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    );
  }

  function addService() {
    setServices((prev) => [...prev, { title: "", description: "" }]);
  }

  function removeService(index: number) {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }

  function moveService(index: number, direction: -1 | 1) {
    setServices((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {services.map((service, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 border border-border-strong p-4"
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-display text-sm text-foreground-muted">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => moveService(i, -1)}
                disabled={i === 0}
                className="text-foreground-muted hover:text-foreground disabled:opacity-30"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveService(i, 1)}
                disabled={i === services.length - 1}
                className="text-foreground-muted hover:text-foreground disabled:opacity-30"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeService(i)}
                className="text-foreground-muted hover:text-error"
              >
                Rimuovi
              </button>
            </div>
          </div>
          <input
            type="text"
            value={service.title}
            onChange={(e) => updateService(i, "title", e.target.value)}
            placeholder="Titolo (es. Web Design)"
            className="w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm font-medium text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
          />
          <input
            type="text"
            value={service.description}
            onChange={(e) => updateService(i, "description", e.target.value)}
            placeholder="Descrizione breve"
            className="w-full border-0 border-b border-border-strong bg-transparent py-1 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
          />
        </div>
      ))}

      <button
        type="button"
        onClick={addService}
        className="w-max border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:border-accent hover:text-accent"
      >
        + Aggiungi servizio
      </button>

      <input type="hidden" name={name} value={JSON.stringify(services)} />
    </div>
  );
}

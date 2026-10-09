"use client";

import { useState, useTransition } from "react";
import { restoreRevision } from "@/lib/actions/history";
import type { RevisionItem } from "@/lib/data/history";

const format = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Versioni precedenti di un contenuto: ogni salvataggio conserva la
 * versione di prima (le ultime 20). Ripristinarne una salva prima quella
 * attuale, quindi anche il ripristino si può annullare.
 */
export function RevisionsPanel({ revisions }: { revisions: RevisionItem[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function restore(id: string, label: string) {
    if (
      !window.confirm(
        `Riportare il contenuto alla versione del ${label}? La versione attuale resta nella cronologia.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await restoreRevision(id);
      if (result.error) setError(result.error);
      else window.location.reload();
    });
  }

  return (
    <section className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center justify-between text-left text-sm font-medium"
      >
        Versioni precedenti
        <span className="text-xs text-foreground-muted tabular-nums">
          {revisions.length}
        </span>
      </button>
      {open ? (
        revisions.length === 0 ? (
          <p className="text-xs text-foreground-muted">
            Nessuna versione salvata finora: comparirà dal prossimo
            salvataggio.
          </p>
        ) : (
          <ul className="flex max-h-56 flex-col overflow-y-auto">
            {revisions.map((r) => {
              const label = format.format(new Date(r.created_at));
              return (
                <li
                  key={r.id}
                  className="flex items-center justify-between gap-2 border-b border-border py-1.5 text-xs last:border-b-0"
                >
                  <span className="text-foreground-muted">{label}</span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => restore(r.id, label)}
                    className="min-h-8 px-1 text-foreground-muted underline-offset-4 hover:text-accent hover:underline disabled:opacity-50"
                  >
                    Ripristina
                  </button>
                </li>
              );
            })}
          </ul>
        )
      ) : null}
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </section>
  );
}

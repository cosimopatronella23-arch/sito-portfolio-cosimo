"use client";

import { startTransition, useActionState, useRef, useState } from "react";
import { saveSettingsGroups, type SettingsState } from "@/lib/actions/siteSettings";
import { useUnsavedChanges } from "../useUnsavedChanges";

/**
 * Modulo delle impostazioni a gruppi: manda solo i campi della pagina
 * (vedi saveSettingsGroups), un solo pulsante Salva sempre visibile in
 * basso, avviso se esci con modifiche non salvate.
 */
export function GroupForm({
  groups,
  children,
  saveLabel = "Salva le modifiche",
  formId,
  compactBar = false,
}: {
  groups: string[];
  children: React.ReactNode;
  saveLabel?: string;
  formId?: string;
  /** Barra di salvataggio stretta, per il pannello laterale della homepage. */
  compactBar?: boolean;
}) {
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    saveSettingsGroups,
    { error: null },
  );
  const formRef = useRef<HTMLFormElement>(null);
  const [dirty, setDirty] = useUnsavedChanges(formRef);
  const [lastState, setLastState] = useState(state);
  if (state !== lastState) {
    setLastState(state);
    if (state.success) setDirty(false);
  }

  // Invio senza <form action>: React altrimenti riporterebbe i campi ai
  // valori iniziali dopo il salvataggio.
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <form ref={formRef} id={formId} onSubmit={handleSubmit} className="flex min-h-0 flex-col">
      <input type="hidden" name="groups" value={groups.join(",")} />
      <div className={compactBar ? "min-h-0 flex-1 overflow-y-auto" : ""}>{children}</div>
      <div
        className={
          compactBar
            ? "flex flex-wrap items-center gap-3 border-t border-border-strong bg-surface px-5 py-4"
            : "sticky bottom-0 z-20 mt-6 flex flex-wrap items-center gap-4 border-t border-border-strong bg-background/95 py-4 backdrop-blur"
        }
      >
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 bg-foreground px-6 text-sm font-semibold text-background transition-colors hover:bg-accent disabled:opacity-50"
        >
          {pending ? "Salvo..." : saveLabel}
        </button>
        <p role="status" aria-live="polite" className="text-sm">
          {state.error ? (
            <span className="text-error">{state.error}</span>
          ) : pending ? null : dirty ? (
            <span className="text-foreground-muted">Modifiche non salvate</span>
          ) : state.success ? (
            <span className="text-success">Salvato. Il sito è aggiornato.</span>
          ) : null}
        </p>
      </div>
    </form>
  );
}

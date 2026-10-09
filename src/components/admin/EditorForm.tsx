"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { AdminIcon } from "./AdminIcons";
import { useUnsavedChanges } from "./useUnsavedChanges";

export type EditorFormState = { error: string | null; success?: boolean };

type EditorAction = (
  prevState: EditorFormState,
  formData: FormData,
) => Promise<EditorFormState>;

const timeFormat = new Intl.DateTimeFormat("it-IT", {
  hour: "2-digit",
  minute: "2-digit",
});

/**
 * Modulo di modifica condiviso (progetti, articoli, servizi): contenuto a
 * sinistra, riquadro "Pubblicazione" fisso a destra.
 *
 * - Salva restando nella pagina. L'invio passa da onSubmit invece che da
 *   <form action>, perché con quest'ultimo React riporta i campi ai valori
 *   iniziali dopo il salvataggio e sembrerebbe che le modifiche siano sparite.
 * - Avvisa se si lascia la pagina con modifiche non salvate (link interni,
 *   chiusura della scheda, ricarica).
 * - I nomi dei campi restano quelli dei moduli: la Server Action riceve
 *   esattamente gli stessi dati di prima.
 */
export function EditorForm({
  action,
  submitLabel,
  created = false,
  sidebar,
  sidebarFooter,
  children,
}: {
  action: EditorAction;
  submitLabel: string;
  /** Appena creato: mostra la conferma al primo caricamento. */
  created?: boolean;
  /** Campi del riquadro laterale (stato, ordine, in evidenza...). */
  sidebar?: React.ReactNode;
  /** Sotto il pulsante (link di anteprima, controllo SEO...). */
  sidebarFooter?: React.ReactNode;
  children: React.ReactNode;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(action, {
    error: null,
  });
  const [dirty, setDirty] = useUnsavedChanges(formRef);
  const [savedAt, setSavedAt] = useState<Date | null>(() =>
    created ? new Date() : null,
  );
  const [toast, setToast] = useState(created);
  const [lastState, setLastState] = useState(state);

  // Esito del salvataggio: aggiornato durante il render (pattern React
  // consigliato al posto di un effect) quando arriva un nuovo stato.
  if (state !== lastState) {
    setLastState(state);
    if (state.success) {
      setDirty(false);
      setSavedAt(new Date());
      setToast(true);
    }
  }

  // Toglie "?salvato=1" dall'indirizzo dopo la creazione: ricaricando la
  // pagina la conferma non deve ricomparire. Passa dal router, che
  // altrimenti ripristinerebbe l'indirizzo precedente.
  const router = useRouter();
  const pathname = usePathname();
  useEffect(() => {
    if (created) router.replace(pathname, { scroll: false });
  }, [created, router, pathname]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(false), 4000);
    return () => window.clearTimeout(id);
  }, [toast]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => formAction(formData));
  }

  const status = pending
    ? "Salvataggio in corso..."
    : state.error
      ? null
      : dirty
        ? "Modifiche non salvate"
        : savedAt
          ? `Salvato alle ${timeFormat.format(savedAt)}`
          : "Nessuna modifica";

  const saveButton = (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex min-h-11 w-full items-center justify-center bg-foreground px-6 text-sm font-medium text-background transition-colors hover:bg-accent disabled:opacity-50"
    >
      {pending ? "Salvo..." : submitLabel}
    </button>
  );

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_18rem]"
    >
      <div className="flex min-w-0 flex-col gap-6">{children}</div>

      <aside className="flex flex-col gap-5 border border-border-strong bg-surface p-5 xl:sticky xl:top-6">
        <h2 className="font-display text-base font-semibold">Pubblicazione</h2>
        {sidebar ? <div className="flex flex-col gap-4">{sidebar}</div> : null}

        <div className="hidden flex-col gap-2 xl:flex">{saveButton}</div>
        <p
          role="status"
          aria-live="polite"
          className={
            dirty && !pending
              ? "text-sm text-warning"
              : "text-sm text-foreground-muted"
          }
        >
          {status}
        </p>
        {state.error ? (
          <p role="alert" className="text-sm text-error">
            Non salvato: {state.error}
          </p>
        ) : null}

        {sidebarFooter ? (
          <div className="flex flex-col gap-4 border-t border-border pt-4">
            {sidebarFooter}
          </div>
        ) : null}
      </aside>

      {/* Telefono e tablet: pulsante sempre raggiungibile in fondo. */}
      <div className="sticky bottom-0 z-20 -mx-4 border-t border-border-strong bg-background/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:px-8 xl:hidden">
        {saveButton}
      </div>

      {toast ? (
        <div
          role="status"
          className="fixed right-4 bottom-20 z-50 flex items-center gap-2 border border-success/40 bg-surface px-4 py-3 text-sm shadow-lg xl:bottom-6"
        >
          <AdminIcon name="check" className="h-4 w-4 text-success" />
          {created && !lastState.success ? "Creato e salvato." : "Salvato."}
        </div>
      ) : null}
    </form>
  );
}

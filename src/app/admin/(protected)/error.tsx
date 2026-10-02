"use client";

import { useEffect } from "react";

/**
 * Se una pagina dell'admin va in errore (es. il database non risponde per
 * qualche secondo), invece della schermata generica di Next.js mostra un
 * messaggio chiaro e un pulsante per riprovare.
 */
export default function AdminError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex max-w-xl flex-col gap-5 py-10">
      <h1 className="font-display text-2xl font-semibold">
        Qualcosa non ha risposto in tempo.
      </h1>
      <p className="text-foreground-muted">
        Succede a volte subito dopo il login o se il database impiega qualche
        secondo in più. I tuoi contenuti non sono stati toccati: riprova tra
        un attimo.
      </p>
      <button
        type="button"
        onClick={() => retry()}
        className="w-max bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
      >
        Riprova
      </button>
      {error.digest ? (
        <p className="text-xs text-foreground-muted">
          Codice errore: {error.digest}
        </p>
      ) : null}
    </div>
  );
}

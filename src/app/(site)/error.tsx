"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

/**
 * Se una pagina del sito va in errore (es. il database non risponde per
 * qualche secondo), invece della schermata generica di Next.js in inglese
 * compare un messaggio nello stile del sito, con menu e footer intorno,
 * un pulsante per riprovare e le strade principali per proseguire.
 */
export default function SiteError({
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
    <section className="container-px flex min-h-[60svh] flex-col justify-center gap-8 py-24 sm:py-32">
      <p className="font-display text-sm font-medium tracking-wide text-accent uppercase">
        Errore temporaneo
      </p>
      <h1 className="font-display max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
        Questa pagina non si è caricata.
      </h1>
      <p className="max-w-xl text-lg text-foreground-muted">
        Di solito basta riprovare tra qualche secondo. Se il problema resta,
        scrivimi: lo sistemo il prima possibile.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={() => retry()} size="lg">
          Riprova
        </Button>
        <Button href="/" variant="secondary" size="lg">
          Torna alla home
        </Button>
        <Button href="/#contatti" variant="ghost" size="lg">
          Scrivimi
        </Button>
      </div>
      {error.digest ? (
        <p className="text-xs text-foreground-muted">
          Codice errore: {error.digest}
        </p>
      ) : null}
    </section>
  );
}

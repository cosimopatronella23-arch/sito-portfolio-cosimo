"use client";

import { useSyncExternalStore } from "react";
import Script from "next/script";

type Consent = "unknown" | "accepted" | "rejected";

const STORAGE_KEY = "cookie-consent";
const MEASUREMENT_ID_REGEX = /^G-[A-Z0-9]+$/;

const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => listeners.delete(onChange);
}

function getSnapshot(): Consent {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "accepted" || stored === "rejected" ? stored : "unknown";
  } catch {
    return "unknown";
  }
}

function getServerSnapshot(): Consent {
  return "unknown";
}

function setConsent(value: "accepted" | "rejected") {
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // niente da fare se non riusciamo a salvare la preferenza
  }
  listeners.forEach((listener) => listener());
}

/**
 * Banner di consenso cookie + caricamento di GA4. Lo script gtag.js parte
 * solo dopo che l'utente clicca "Accetta" — obbligatorio per il GDPR, dato
 * che l'analytics non è un cookie "tecnico" esente da consenso. Usa
 * useSyncExternalStore per leggere localStorage in modo sicuro per l'SSR
 * (il server non ha accesso al browser, quindi vede sempre "unknown").
 */
export function GoogleAnalytics({
  measurementId,
}: {
  measurementId: string | null;
}) {
  const consent = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  if (!measurementId || !MEASUREMENT_ID_REGEX.test(measurementId)) {
    return null;
  }

  return (
    <>
      {consent === "accepted" ? (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${measurementId}', { anonymize_ip: true });`}
          </Script>
        </>
      ) : null}

      {consent === "unknown" ? (
        <div
          role="dialog"
          aria-label="Consenso cookie"
          className="container-px fixed inset-x-0 bottom-0 z-[100] border-t border-border-strong bg-background/95 py-5 backdrop-blur-md"
        >
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm text-foreground-muted">
              Uso cookie di analisi anonimi (Google Analytics) solo se
              acconsenti, per capire come viene usato il sito. Puoi cambiare
              idea quando vuoi.
            </p>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setConsent("rejected")}
                className="border border-border-strong px-4 py-2 text-sm text-foreground-muted transition-colors hover:text-foreground"
              >
                Rifiuta
              </button>
              <button
                type="button"
                onClick={() => setConsent("accepted")}
                className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent"
              >
                Accetta
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

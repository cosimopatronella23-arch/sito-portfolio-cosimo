"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { trackLead } from "@/lib/analytics";

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

  // Click su email o telefono (footer, sezione contatti, articoli): sono
  // contatti tanto quanto l'invio del form.
  useEffect(() => {
    if (consent !== "accepted") return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (href.startsWith("mailto:")) trackLead("email");
      else if (href.startsWith("tel:")) trackLead("phone");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [consent]);

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
            <div className="flex max-w-2xl flex-col gap-1.5 text-sm">
              <p className="font-medium text-foreground">
                Un cookie? Tranquillo, non entro nel tuo conto in banca.
              </p>
              <p className="text-foreground-muted">
                Solo statistiche di Google Analytics su quali pagine vengono
                viste, senza sapere chi sei: mi aiutano a capire cosa
                funziona. Se rifiuti, il sito funziona esattamente uguale.{" "}
                <Link
                  href="/cookie-policy"
                  className="underline underline-offset-2 hover:text-foreground"
                >
                  Dettagli
                </Link>
              </p>
            </div>
            <div className="flex shrink-0 gap-3">
              <button
                type="button"
                onClick={() => setConsent("rejected")}
                className="border border-border-strong px-4 py-2 text-sm text-foreground transition-colors hover:border-foreground"
              >
                No, grazie
              </button>
              <button
                type="button"
                onClick={() => setConsent("accepted")}
                className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-accent"
              >
                Accetta, dai
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

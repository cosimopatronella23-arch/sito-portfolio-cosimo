"use client";

import { useEffect, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { OWNER_OPT_OUT_KEY, trackLead } from "@/lib/analytics";
import { FALLBACK_HOST, PRIMARY_HOST } from "@/lib/domain";

type Consent = "unknown" | "accepted" | "rejected";

const STORAGE_KEY = "cookie-consent";
// Solo il sito vero (e l'indirizzo di riserva, se un giorno servisse):
// mai gli indirizzi di anteprima dei singoli deploy né localhost.
const TRACKED_HOSTS = new Set([PRIMARY_HOST, `www.${PRIMARY_HOST}`, FALLBACK_HOST]);

function isTrackedVisitor() {
  try {
    return (
      TRACKED_HOSTS.has(window.location.host) &&
      window.localStorage.getItem(OWNER_OPT_OUT_KEY) !== "1"
    );
  } catch {
    return TRACKED_HOSTS.has(window.location.host);
  }
}
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

  // Il banner si mostra sempre uguale a tutti; cambia solo se gtag parte.
  const tracked = useSyncExternalStore(subscribe, isTrackedVisitor, () => false);
  const load = consent === "accepted" && tracked;

  // Click su email o telefono (footer, sezione contatti, articoli): sono
  // contatti tanto quanto l'invio del form.
  useEffect(() => {
    if (!load) return;
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      if (href.startsWith("mailto:")) trackLead("email");
      else if (href.startsWith("tel:")) trackLead("phone");
      else if (href.startsWith("https://wa.me/")) trackLead("whatsapp");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [load]);

  if (!measurementId || !MEASUREMENT_ID_REGEX.test(measurementId)) {
    return null;
  }

  return (
    <>
      {load ? (
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
          className="theme-paper fixed inset-x-3 bottom-3 z-[100] flex flex-col gap-4 border-2 border-foreground bg-background p-5 text-foreground motion-safe:animate-[cookie-in_0.5s_cubic-bezier(0.22,1,0.36,1)] sm:inset-x-auto sm:bottom-6 sm:left-6 sm:max-w-sm sm:p-6"
        >
          <div className="flex items-start gap-3">
            <span aria-hidden="true" className="mt-1 size-3.5 shrink-0 rounded-full bg-accent" />
            <div className="flex flex-col gap-2 text-sm leading-relaxed">
              <p className="font-display text-base font-bold tracking-[-0.01em]">
                Solo statistiche di visita.
              </p>
              <p className="text-foreground-muted">
                Google Analytics mi dice quali pagine vengono viste, non chi
                sei. Parte solo se accetti; se rifiuti, il sito funziona
                uguale.
              </p>
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold tracking-[0.06em] uppercase">
                <Link href="/blog/banner-cookie-cosa-accetti-davvero" className="link-draw">
                  Perché te lo chiedo
                </Link>
                <Link href="/cookie-policy" className="link-draw">
                  Cookie policy
                </Link>
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="secondary" onClick={() => setConsent("rejected")}>
              Rifiuta
            </Button>
            <Button type="button" onClick={() => setConsent("accepted")}>
              Accetta
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}

type Gtag = (...args: unknown[]) => void;

/**
 * Registra un contatto su Google Analytics ("generate_lead", l'evento
 * standard di GA4 per i contatti). Se il visitatore non ha accettato i
 * cookie gtag non è caricato e la chiamata non fa nulla.
 */
export function trackLead(method: "form" | "email" | "phone") {
  const gtag = (window as Window & { gtag?: Gtag }).gtag;
  gtag?.("event", "generate_lead", { method });
}

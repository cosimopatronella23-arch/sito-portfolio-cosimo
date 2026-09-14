"use client";

const STORAGE_KEY = "cookie-consent";

// Cancella la scelta salvata e ricarica: GoogleAnalytics.tsx la legge da
// localStorage e, non trovandola più, torna a mostrare il banner iniziale —
// così l'utente può cambiare idea in qualsiasi momento, come richiede il GDPR.
export function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        try {
          window.localStorage.removeItem(STORAGE_KEY);
        } catch {
          // niente da fare se localStorage non è disponibile
        }
        window.location.reload();
      }}
      className="border border-border-strong px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent"
    >
      Gestisci preferenze cookie
    </button>
  );
}

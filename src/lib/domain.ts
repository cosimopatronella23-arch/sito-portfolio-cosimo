/**
 * Dominio principale e dominio di riserva del sito.
 *
 * Il sito vive su PRIMARY_URL; FALLBACK_URL (l'indirizzo *.vercel.app) resta
 * sempre attivo e reindirizza al principale SOLO finché il principale
 * risponde davvero con questo sito (vedi isPrimaryHealthy). Se il dominio
 * .it non venisse rinnovato, il vecchio indirizzo smette da solo di
 * reindirizzare e il sito resta raggiungibile.
 */
export const PRIMARY_URL = "https://cosimopatronella.it";
export const FALLBACK_URL = "https://cosimopatronella.vercel.app";

export const PRIMARY_HOST = new URL(PRIMARY_URL).host;
export const FALLBACK_HOST = new URL(FALLBACK_URL).host;

/** Contrassegno restituito da /api/health: distingue il nostro sito da una
 * pagina di parcheggio del registrar (che risponderebbe comunque 200). */
export const HEALTH_MARKER = "cosimopatronella-site";

/**
 * true se PRIMARY_URL risponde con questo sito. Timeout breve: in caso di
 * dubbio si risponde false, cioè "non reindirizzare" — l'errore sicuro.
 */
export async function isPrimaryHealthy(timeoutMs = 2000): Promise<boolean> {
  try {
    const res = await fetch(`${PRIMARY_URL}/api/health`, {
      signal: AbortSignal.timeout(timeoutMs),
      cache: "no-store",
      redirect: "manual",
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { site?: string };
    return data.site === HEALTH_MARKER;
  } catch {
    return false;
  }
}

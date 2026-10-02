/**
 * Subito dopo il login, a volte il database di Supabase rifiuta il token
 * appena emesso con "JWT issued at future" (PGRST303): l'orologio del
 * server che lo emette è qualche secondo avanti rispetto a quello del
 * database. Basta aspettare un attimo e riprovare. Senza, la prima pagina
 * dell'admin dopo il login poteva andare in errore 500.
 */
export const fetchWithClockSkewRetry: typeof fetch = async (input, init) => {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(input, init);
    const retryable =
      res.status === 401 &&
      attempt < 3 &&
      (init?.body === undefined || typeof init.body === "string");
    if (!retryable) return res;
    const body = await res.clone().text();
    if (!body.includes("PGRST303")) return res;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};


/**
 * Riprova una funzione asincrona in caso di errore (rete instabile,
 * timeout momentanei) prima di arrendersi. Usato per le letture pubbliche
 * da Supabase chiamate durante la build (generateStaticParams/metadata):
 * un singolo blip di rete non deve far fallire l'intera build del sito.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  attempts = 3,
  delayMs = 500,
): Promise<T> {
  let lastError: unknown;

  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < attempts - 1) {
        await new Promise((resolve) => setTimeout(resolve, delayMs * (i + 1)));
      }
    }
  }

  throw lastError;
}

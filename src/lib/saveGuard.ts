import "server-only";
import type { createAdminClient } from "@/lib/supabase/server";
import type { HistoryTable } from "@/lib/history";

type Client = Awaited<ReturnType<typeof createAdminClient>>;
type DbError = { code?: string; message?: string; details?: string } | null;

/**
 * Traduce gli errori del database in un messaggio che dice cosa correggere.
 * Il testo tecnico originale resta in coda solo per i casi non previsti,
 * così un problema nuovo si può comunque diagnosticare.
 */
export function friendlyDbError(error: DbError): string {
  if (!error) return "Errore sconosciuto. Riprova.";
  const text = `${error.message ?? ""} ${error.details ?? ""}`;
  if (error.code === "23505") {
    return text.includes("slug")
      ? "Esiste già un contenuto con questo indirizzo (slug). Scegline uno diverso."
      : "Esiste già un contenuto con questi dati. Cambia il valore duplicato.";
  }
  if (error.code === "42501" || /row-level security|permission denied/i.test(text)) {
    return "Non hai i permessi per questa modifica. Esci e accedi di nuovo.";
  }
  if (error.code === "23502") return "Manca un campo obbligatorio.";
  if (error.code === "22001") return "Uno dei testi è troppo lungo.";
  if (error.code === "23514") return "Uno dei valori non è ammesso.";
  if (error.code === "PGRST301" || /JWT/i.test(text)) {
    return "La sessione è scaduta. Ricarica la pagina e accedi di nuovo.";
  }
  if (/fetch failed|network|timeout|ECONN/i.test(text)) {
    return "Il database non risponde. Controlla la connessione e riprova.";
  }
  return `Salvataggio non riuscito. Riprova tra poco. (Dettaglio tecnico: ${error.message ?? "nessuno"})`;
}

/** Data dell'ultima modifica salvata, o null se il contenuto non esiste. */
export async function currentVersion(
  supabase: Client,
  table: HistoryTable,
  id: string,
): Promise<string | null> {
  const { data } = await supabase
    .from(table)
    .select("updated_at")
    .eq("id", id)
    .maybeSingle();
  return (data?.updated_at as string | undefined) ?? null;
}

/**
 * true se il contenuto è stato modificato dopo che il modulo è stato
 * aperto (per esempio da un'altra scheda rimasta aperta): salvare ora
 * cancellerebbe quelle modifiche. Il modulo manda la versione che aveva
 * caricato in "expected_updated_at"; "force" = l'utente ha scelto di
 * sovrascrivere comunque.
 */
export async function isStaleSave(
  supabase: Client,
  table: HistoryTable,
  id: string,
  formData: FormData,
): Promise<boolean> {
  if (formData.get("force") === "1") return false;
  const expected = String(formData.get("expected_updated_at") || "");
  if (!expected) return false;
  const current = await currentVersion(supabase, table, id);
  if (!current) return false;
  return new Date(current).getTime() - new Date(expected).getTime() > 1000;
}

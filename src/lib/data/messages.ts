import "server-only";
import { createAdminClient } from "@/lib/supabase/server";
import { isMissingTable } from "@/lib/history";

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  email_sent: boolean;
  read_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

/**
 * Messaggi del modulo contatti per l'admin. "available" è false finché la
 * migrazione 0012 non è stata eseguita: la pagina lo spiega invece di
 * andare in errore.
 */
export async function getMessagesAdmin(
  box: "inbox" | "trash",
): Promise<{ available: boolean; messages: ContactMessage[] }> {
  const supabase = await createAdminClient();
  let query = supabase
    .from("contact_messages")
    .select(
      "id, name, email, message, email_sent, read_at, deleted_at, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(500);
  query =
    box === "trash"
      ? query.not("deleted_at", "is", null)
      : query.is("deleted_at", null);
  const { data, error } = await query;
  if (error) return { available: !isMissingTable(error), messages: [] };
  return { available: true, messages: (data ?? []) as ContactMessage[] };
}

/** Messaggi da leggere (0 se la tabella non c'è ancora o non risponde). */
export async function countUnreadMessages(): Promise<number> {
  const supabase = await createAdminClient();
  const { count, error } = await supabase
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .is("read_at", null)
    .is("deleted_at", null);
  return error ? 0 : (count ?? 0);
}

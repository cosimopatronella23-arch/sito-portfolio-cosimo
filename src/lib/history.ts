import "server-only";
import type { createAdminClient } from "@/lib/supabase/server";

export type HistoryTable = "projects" | "blog_posts" | "service_pages";

type Client = Awaited<ReturnType<typeof createAdminClient>>;

const KEEP_REVISIONS = 20;
const TRASH_DAYS = 30;

// Le tabelle arrivano con la migrazione 0010: finché non è stata eseguita,
// cestino e cronologia si disattivano da soli e tutto funziona come prima.
export function isMissingTable(error: { code?: string } | null) {
  return !!error && (error.code === "42P01" || error.code === "PGRST205");
}

/**
 * Salva la versione attuale di un contenuto prima di sovrascriverlo, e
 * tiene solo le ultime 20. Non blocca mai il salvataggio: se qualcosa va
 * storto si salva comunque, solo senza copia nella cronologia.
 */
export async function snapshotRevision(
  supabase: Client,
  table: HistoryTable,
  id: string,
) {
  try {
    const { data: row } = await supabase
      .from(table)
      .select("*")
      .eq("id", id)
      .maybeSingle();
    if (!row) return;

    const { error } = await supabase
      .from("content_revisions")
      .insert({ table_name: table, record_id: id, data: row });
    if (error) return;

    const { data: old } = await supabase
      .from("content_revisions")
      .select("id")
      .eq("table_name", table)
      .eq("record_id", id)
      .order("created_at", { ascending: false })
      .range(KEEP_REVISIONS, KEEP_REVISIONS + 100);
    if (old?.length) {
      await supabase
        .from("content_revisions")
        .delete()
        .in(
          "id",
          old.map((r) => r.id),
        );
    }
  } catch {
    /* la cronologia non deve mai impedire un salvataggio */
  }
}

/**
 * Elimina un contenuto mettendolo prima nel cestino. Se la copia nel
 * cestino non riesce per un errore vero, il contenuto NON viene eliminato.
 */
export async function moveToTrash(
  supabase: Client,
  table: HistoryTable,
  id: string,
): Promise<{ error: string | null }> {
  const { data: row, error: readError } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (readError) return { error: readError.message };
  if (!row) return { error: null };

  const { error: trashError } = await supabase.from("content_trash").insert({
    table_name: table,
    record_id: id,
    title: String(row.title ?? ""),
    data: row,
  });
  if (trashError && !isMissingTable(trashError)) {
    return { error: trashError.message };
  }

  const { error } = await supabase.from(table).delete().eq("id", id);
  return { error: error?.message ?? null };
}

/** Svuota dal cestino ciò che c'è da più di 30 giorni. */
export async function purgeOldTrash(supabase: Client) {
  const limit = new Date(Date.now() - TRASH_DAYS * 864e5).toISOString();
  await supabase.from("content_trash").delete().lt("deleted_at", limit);
}


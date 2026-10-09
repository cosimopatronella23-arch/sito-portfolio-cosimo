import { createClient } from "@/lib/supabase/server";
import { isMissingTable, type HistoryTable } from "@/lib/history";

export type TrashItem = {
  id: string;
  table_name: HistoryTable;
  record_id: string;
  title: string;
  deleted_at: string;
};

export type RevisionItem = { id: string; created_at: string };

/** Per /admin: contenuti nel cestino, dal più recente. */
export async function getTrashAdmin(): Promise<TrashItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_trash")
    .select("id, table_name, record_id, title, deleted_at")
    .order("deleted_at", { ascending: false });
  if (isMissingTable(error)) return [];
  if (error) throw error;
  return data ?? [];
}

/** Per /admin: versioni precedenti di un contenuto, dalla più recente. */
export async function getRevisionsAdmin(
  table: HistoryTable,
  recordId: string,
): Promise<RevisionItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("content_revisions")
    .select("id, created_at")
    .eq("table_name", table)
    .eq("record_id", recordId)
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) return [];
  return data ?? [];
}

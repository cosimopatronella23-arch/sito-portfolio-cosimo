"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { snapshotRevision, type HistoryTable } from "@/lib/history";

const TABLES: Record<HistoryTable, { admin: string; label: string }> = {
  projects: { admin: "/admin/progetti", label: "Progetto" },
  blog_posts: { admin: "/admin/blog", label: "Articolo" },
  service_pages: { admin: "/admin/servizi", label: "Servizio" },
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function revalidateAll(table: HistoryTable) {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath(TABLES[table].admin);
  revalidatePath("/admin/cestino");
}

export async function restoreFromTrash(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!UUID.test(id)) return;

  const supabase = await createAdminClient();
  const { data: item } = await supabase
    .from("content_trash")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!item || !(item.table_name in TABLES)) return;
  const table = item.table_name as HistoryTable;

  let { error } = await supabase.from(table).insert(item.data);
  // Indirizzo (slug) già usato da un contenuto creato nel frattempo: si
  // ripristina con un indirizzo diverso, in bozza, per non creare doppioni.
  if (error?.code === "23505") {
    const data = {
      ...item.data,
      slug: `${item.data.slug}-ripristinato-${Date.now().toString(36)}`,
      status: "draft",
    };
    ({ error } = await supabase.from(table).insert(data));
  }
  if (error) return;

  await supabase.from("content_trash").delete().eq("id", id);
  revalidateAll(table);
}

export async function deleteForever(formData: FormData) {
  const id = String(formData.get("id") || "");
  if (!UUID.test(id)) return;

  const supabase = await createAdminClient();
  const { data: item } = await supabase
    .from("content_trash")
    .select("table_name, record_id")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("content_trash").delete().eq("id", id);
  // Anche le sue versioni salvate: il contenuto non esiste più.
  if (item) {
    await supabase
      .from("content_revisions")
      .delete()
      .eq("table_name", item.table_name)
      .eq("record_id", item.record_id);
  }
  revalidatePath("/admin/cestino");
}

/**
 * Riporta un contenuto a una versione precedente. Prima salva quella
 * attuale nella cronologia, così anche il ripristino si può annullare.
 */
export async function restoreRevision(
  revisionId: string,
): Promise<{ error: string | null }> {
  if (!UUID.test(revisionId)) return { error: "Versione non valida." };

  const supabase = await createAdminClient();
  const { data: revision, error: readError } = await supabase
    .from("content_revisions")
    .select("*")
    .eq("id", revisionId)
    .maybeSingle();
  if (readError || !revision) return { error: "Versione non trovata." };
  if (!(revision.table_name in TABLES)) return { error: "Versione non valida." };
  const table = revision.table_name as HistoryTable;

  await snapshotRevision(supabase, table, revision.record_id);

  const {
    id: _id,
    created_at: _createdAt,
    updated_at: _updatedAt,
    ...fields
  } = revision.data as Record<string, unknown>;
  const { error } = await supabase
    .from(table)
    .update(fields)
    .eq("id", revision.record_id);
  if (error) return { error: error.message };

  revalidateAll(table);
  return { error: null };
}

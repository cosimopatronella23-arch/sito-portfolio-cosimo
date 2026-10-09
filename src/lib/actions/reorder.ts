"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

const TABLES = {
  projects: "/admin/progetti",
  service_pages: "/admin/servizi",
} as const;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Salva l'ordine scelto trascinando gli elementi in /admin: il primo
 * dell'elenco riceve sort_order 10, il secondo 20 e così via (a passi di
 * 10, così resta spazio per inserimenti manuali in mezzo).
 */
export async function saveOrder(
  table: keyof typeof TABLES,
  ids: string[],
): Promise<{ error: string | null }> {
  if (!(table in TABLES)) return { error: "Elenco non valido." };
  if (!Array.isArray(ids) || ids.length > 500 || !ids.every((id) => UUID.test(id))) {
    return { error: "Ordine non valido." };
  }

  const supabase = await createAdminClient();
  const results = await Promise.all(
    ids.map((id, i) =>
      supabase
        .from(table)
        .update({ sort_order: (i + 1) * 10 })
        .eq("id", id),
    ),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  // L'ordine conta in homepage, nelle pagine elenco e nel footer (servizi):
  // si aggiorna tutto il sito.
  revalidatePath("/", "layout");
  revalidatePath(TABLES[table]);
  return { error: null };
}

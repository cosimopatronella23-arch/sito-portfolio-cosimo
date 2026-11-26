"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import { applySettingsGroups } from "@/lib/settingsPatch";
import type { HomeContent } from "@/lib/types";
import { friendlyDbError } from "@/lib/saveGuard";

/**
 * Salvataggio a gruppi delle impostazioni del sito. Ogni pagina dell'admin
 * (Impostazioni, Colori, Menu e footer, Homepage e le sue sezioni) manda
 * solo i propri campi, elencati in "groups": si legge la riga attuale e si
 * cambiano solo quelli, così una pagina non può mai cancellare i dati di
 * un'altra (come le recensioni o i blocchi della homepage).
 */

export type SettingsState = { error: string | null; success?: boolean };

export async function saveSettingsGroups(
  _prev: SettingsState,
  fd: FormData,
): Promise<SettingsState> {
  const supabase = await createAdminClient();
  const { data: current, error: readError } = await supabase
    .from("site_settings")
    .select("home_content")
    .eq("id", "main")
    .maybeSingle();
  if (readError || !current) {
    return { error: "Non riesco a leggere le impostazioni attuali. Riprova." };
  }

  const result = applySettingsGroups(
    current.home_content as HomeContent,
    String(fd.get("groups") || ""),
    fd,
  );
  if ("error" in result) return { error: result.error };

  const { error } = await supabase
    .from("site_settings")
    .update({ ...result.columns, home_content: result.home })
    .eq("id", "main");
  if (error) return { error: friendlyDbError(error) };

  revalidatePath("/", "layout");
  return { error: null, success: true };
}

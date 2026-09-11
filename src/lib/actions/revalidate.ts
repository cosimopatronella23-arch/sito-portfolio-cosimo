"use server";

import { revalidatePath } from "next/cache";

/**
 * Forza l'aggiornamento immediato delle pagine pubbliche, invece di aspettare
 * la revalidation oraria automatica. Non tocca il database: rigenera solo
 * la cache di rendering.
 */
export async function revalidateSite() {
  revalidatePath("/", "layout");
}

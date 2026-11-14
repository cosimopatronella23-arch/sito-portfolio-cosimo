"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";

const UUID = /^[0-9a-f-]{36}$/i;

function idFrom(formData: FormData) {
  const id = String(formData.get("id") || "");
  return UUID.test(id) ? id : null;
}

function refresh() {
  revalidatePath("/admin", "layout");
}

/** Segna un messaggio come letto o da leggere. */
export async function setMessageRead(formData: FormData) {
  const id = idFrom(formData);
  if (!id) return;
  const read = formData.get("read") === "1";
  const supabase = await createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ read_at: read ? new Date().toISOString() : null })
    .eq("id", id);
  refresh();
}

/** Segna come letto solo se non lo era già (apertura del messaggio). */
export async function markMessageOpened(id: string) {
  if (!UUID.test(id)) return;
  const supabase = await createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);
  refresh();
}

/** Sposta nel cestino dei messaggi (recuperabile). */
export async function trashMessage(formData: FormData) {
  const id = idFrom(formData);
  if (!id) return;
  const supabase = await createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  refresh();
}

/** Riporta un messaggio dal cestino tra quelli ricevuti. */
export async function restoreMessage(formData: FormData) {
  const id = idFrom(formData);
  if (!id) return;
  const supabase = await createAdminClient();
  await supabase
    .from("contact_messages")
    .update({ deleted_at: null })
    .eq("id", id);
  refresh();
}

/** Elimina per sempre: solo messaggi già nel cestino. */
export async function deleteMessageForever(formData: FormData) {
  const id = idFrom(formData);
  if (!id) return;
  const supabase = await createAdminClient();
  await supabase
    .from("contact_messages")
    .delete()
    .eq("id", id)
    .not("deleted_at", "is", null);
  refresh();
}

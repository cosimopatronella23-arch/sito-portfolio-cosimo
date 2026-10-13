"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/server";
import type { ClientReview, HomeContent } from "@/lib/types";

type FormState = { error: string | null; success?: boolean };

const text = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

function sanitize(raw: unknown): ClientReview[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((r) => {
      const item = (r ?? {}) as Record<string, unknown>;
      const rating = Math.round(Number(item.rating));
      return {
        id: text(item.id, 64) || crypto.randomUUID(),
        author: text(item.author, 120),
        context: text(item.context, 160),
        text: text(item.text, 2000),
        rating: rating >= 1 && rating <= 5 ? rating : 5,
        date: /^\d{4}-\d{2}$/.test(String(item.date)) ? String(item.date) : "",
        project_slug: /^[a-z0-9-]*$/.test(String(item.project_slug ?? ""))
          ? text(item.project_slug, 120)
          : "",
        visible: item.visible !== false,
      };
    })
    .filter((r) => r.author && r.text)
    .slice(0, 50);
}

/**
 * Salva le recensioni dentro i contenuti della homepage, senza toccare il
 * resto: legge i contenuti attuali, sostituisce solo "reviews" e riscrive.
 */
export async function updateReviews(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  let reviews: ClientReview[];
  try {
    reviews = sanitize(JSON.parse(String(formData.get("reviews") || "[]")));
  } catch {
    return { error: "Dati delle recensioni non validi." };
  }

  const supabase = await createAdminClient();
  const { data: current, error: readError } = await supabase
    .from("site_settings")
    .select("home_content")
    .eq("id", "main")
    .maybeSingle();
  if (readError || !current) {
    return { error: readError?.message ?? "Impostazioni non trovate." };
  }

  const homeContent = { ...(current.home_content as HomeContent), reviews };
  const { error } = await supabase
    .from("site_settings")
    .update({ home_content: homeContent })
    .eq("id", "main");
  if (error) return { error: error.message };

  revalidatePath("/", "layout");
  revalidatePath("/admin/recensioni");
  return { error: null, success: true };
}

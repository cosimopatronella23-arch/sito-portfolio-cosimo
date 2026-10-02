import { createPublicClient } from "@/lib/supabase/publicClient";
import { createClient } from "@/lib/supabase/server";
import { withRetry } from "@/lib/withRetry";
import type { ServiceFaq, ServicePage } from "@/lib/types";

const arr = <T>(raw: unknown): T[] => (Array.isArray(raw) ? (raw as T[]) : []);

function normalize(row: Record<string, unknown> | null): ServicePage | null {
  if (!row) return null;
  return {
    ...(row as unknown as ServicePage),
    content_blocks: arr(row.content_blocks),
    faqs: arr<ServiceFaq>(row.faqs).filter((f) => f?.question && f?.answer),
    related_project_slugs: arr<string>(row.related_project_slugs),
  };
}

// La tabella arriva con la migrazione 0009: finché non è stata eseguita su
// Supabase, le pagine pubbliche devono comportarsi come se non ci fossero
// servizi, invece di far fallire la build.
function isMissingTable(error: { code?: string } | null) {
  return !!error && (error.code === "42P01" || error.code === "PGRST205");
}

export async function getPublishedServices(): Promise<ServicePage[]> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("service_pages")
      .select("*")
      .eq("status", "published")
      .order("sort_order");
    if (isMissingTable(error)) return [];
    if (error) throw error;
    return (data ?? []).map((r) => normalize(r)!);
  });
}

export async function getServiceBySlug(
  slug: string,
): Promise<ServicePage | null> {
  return withRetry(async () => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("service_pages")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (isMissingTable(error)) return null;
    if (error) throw error;
    return normalize(data);
  });
}

/** Servizi pubblicati che citano questo progetto tra i progetti collegati. */
export async function getServicesForProject(
  projectSlug: string,
): Promise<ServicePage[]> {
  const services = await getPublishedServices();
  return services.filter((s) => s.related_project_slugs.includes(projectSlug));
}

/** Per /admin: vede anche le bozze, richiede la sessione dell'utente loggato. */
export async function getAllServicesAdmin(): Promise<ServicePage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_pages")
    .select("*")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map((r) => normalize(r)!);
}

export async function getServiceByIdAdmin(
  id: string,
): Promise<ServicePage | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("service_pages")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return normalize(data);
}

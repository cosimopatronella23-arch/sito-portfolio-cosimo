import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase per le letture pubbliche (homepage, progetti, blog).
 * A differenza di quello in server.ts, NON legge i cookie della richiesta:
 * questo permette a Next.js di rendere queste pagine in modo statico/ISR
 * invece di ricalcolarle ad ogni visita. Usa solo la anon key — le regole
 * di accesso restano quelle delle policy RLS pubbliche.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

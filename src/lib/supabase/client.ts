import { createBrowserClient } from "@supabase/ssr";

/**
 * Client Supabase per i Client Component (es. upload immagini in /admin).
 * Usa la anon key: le regole di accesso reale sono nelle policy RLS.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

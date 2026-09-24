import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Client Supabase per Server Component / Server Action. Legge la sessione
 * dai cookie della richiesta corrente — le mutazioni sfruttano le policy RLS
 * legate all'utente autenticato, senza bisogno della service role key.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Chiamato da un Server Component: i cookie non si possono
            // scrivere qui. Il proxy.ts si occupa di rinfrescare la sessione.
          }
        },
      },
    },
  );
}

/**
 * Come createClient(), ma solo per chi è loggato: ogni Server Action
 * dell'admin passa da qui. Il proxy protegge le pagine /admin, ma una
 * Server Action è richiamabile direttamente da chiunque ne conosca l'ID —
 * senza questo controllo, azioni come "svuota cache" o "esporta backup"
 * sarebbero state eseguibili anche da visitatori anonimi.
 */
export async function createAdminClient() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  return supabase;
}

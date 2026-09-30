import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  FALLBACK_HOST,
  PRIMARY_HOST,
  PRIMARY_URL,
  isPrimaryHealthy,
} from "@/lib/domain";

// Esito del controllo sul dominio principale, riusato per qualche minuto
// invece di rifarlo a ogni visita. Se è in salute si ricontrolla dopo 10
// minuti; se non lo è, dopo 2 (così torna a reindirizzare presto quando il
// dominio si riattiva).
let primaryCheck: { healthy: boolean; expiresAt: number } | null = null;

async function primaryIsHealthy() {
  const now = Date.now();
  if (primaryCheck && primaryCheck.expiresAt > now) return primaryCheck.healthy;
  const healthy = await isPrimaryHealthy();
  primaryCheck = {
    healthy,
    expiresAt: now + (healthy ? 10 : 2) * 60 * 1000,
  };
  return healthy;
}

/**
 * 0) www.cosimopatronella.it → cosimopatronella.it (un solo indirizzo per
 *    Google).
 * 1) Sull'indirizzo *.vercel.app di produzione reindirizza (308,
 *    permanente) alla stessa pagina sul dominio principale — ma solo se il
 *    dominio principale risponde davvero con questo sito. Altrimenti mostra
 *    il sito normalmente: nessun visitatore finisce su un dominio scaduto.
 * 2) Protegge tutto ciò che sta sotto /admin: se non sei loggato vieni
 *    rimandato a /admin/login, e rinfresca il cookie di sessione Supabase.
 */
export async function proxy(request: NextRequest) {
  const host = request.headers.get("host");

  if (host === `www.${PRIMARY_HOST}`) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`${PRIMARY_URL}${pathname}${search}`, 308);
  }

  if (host === FALLBACK_HOST && (await primaryIsHealthy())) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`${PRIMARY_URL}${pathname}${search}`, 308);
  }

  if (!request.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isLoginPage = request.nextUrl.pathname === "/admin/login";

  if (!user && !isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  if (user && isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  // Tutto tranne le API (cron, health, ecc. devono rispondere su entrambi
  // gli indirizzi) e i file statici di Next.
  matcher: ["/((?!api|_next/static|_next/image).*)"],
};

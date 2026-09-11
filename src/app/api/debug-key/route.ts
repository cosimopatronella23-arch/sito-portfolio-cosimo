import { NextResponse } from "next/server";
import { getGoogleAuth } from "@/lib/google/client";

// Endpoint temporaneo di sola diagnostica, protetto dallo stesso CRON_SECRET.
// Da rimuovere subito dopo aver risolto il problema della chiave Google.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")?.trim();
  const expected = `Bearer ${process.env.CRON_SECRET?.trim()}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const auth = getGoogleAuth();
  if (!auth) {
    return NextResponse.json({ ok: false, reason: "credenziali mancanti" });
  }

  try {
    await auth.authorize();
    return NextResponse.json({ ok: true, message: "Autenticazione riuscita" });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      reason: error instanceof Error ? error.message : "errore sconosciuto",
    });
  }
}

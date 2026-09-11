import { NextResponse } from "next/server";
import { createPublicClient } from "@/lib/supabase/publicClient";

/**
 * Chiamato una volta al giorno da Vercel Cron (vedi vercel.json). Fa una
 * lettura minima al database solo per tenerlo "attivo": il piano gratuito
 * di Supabase mette in pausa i progetti dopo un periodo di inattività.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")?.trim();
  const expected = `Bearer ${process.env.CRON_SECRET?.trim()}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase
    .from("site_settings")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString() });
}

import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createPublicClient } from "@/lib/supabase/publicClient";
import { FALLBACK_URL, PRIMARY_HOST, isPrimaryHealthy } from "@/lib/domain";

/**
 * Chiamato una volta al giorno da Vercel Cron (vedi vercel.json):
 * 1) fa una lettura minima al database per tenerlo "attivo" (il piano
 *    gratuito di Supabase mette in pausa i progetti inattivi);
 * 2) controlla che il dominio principale risponda ancora con il sito. Se
 *    no (es. rinnovo dimenticato) manda un'email di avviso: nel frattempo il
 *    sito resta raggiungibile sull'indirizzo *.vercel.app.
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")?.trim();
  const expected = `Bearer ${process.env.CRON_SECRET?.trim()}`;
  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("contact_email")
    .limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const domainHealthy = await isPrimaryHealthy(8000);
  let alertSent = false;
  const contactEmail = data?.[0]?.contact_email;

  if (!domainHealthy && contactEmail) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error: mailError } = await resend.emails.send({
      from: "Sito Portfolio <onboarding@resend.dev>",
      to: contactEmail,
      subject: `Attenzione: ${PRIMARY_HOST} non risponde`,
      text: [
        `Il controllo giornaliero non riesce a raggiungere il sito su ${PRIMARY_HOST}.`,
        "",
        "Causa più probabile: il dominio è scaduto o i DNS su Keliweb sono cambiati.",
        "Controlla il rinnovo del dominio nel pannello Keliweb.",
        "",
        `Nel frattempo il sito resta online su ${FALLBACK_URL} e chi usa quell'indirizzo non viene più reindirizzato.`,
        "Riceverai questo avviso ogni giorno finché il dominio non torna a funzionare.",
      ].join("\n"),
    });
    alertSent = !mailError;
  }

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    domainHealthy,
    alertSent,
  });
}

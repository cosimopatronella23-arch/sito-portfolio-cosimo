"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { Resend } from "resend";
import { getSiteSettings } from "@/lib/data/settings";
import { createPublicClient } from "@/lib/supabase/publicClient";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Stessi valori di maxLength in ContactForm (un file "use server" può
// esportare solo funzioni, quindi non si possono condividere da qui).
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

type FormState = { error: string | null; success?: boolean };

/**
 * Impronta della connessione di chi scrive, per limitare gli invii
 * ripetuti. L'IP non viene mai salvato: solo un codice cifrato con una
 * chiave segreta del server, che il database cancella dopo 24 ore.
 */
async function senderHash(): Promise<string | null> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip");
  if (!ip) return null;
  return createHmac("sha256", process.env.CRON_SECRET || "contatti")
    .update(ip)
    .digest("hex")
    .slice(0, 32);
}

type SaveResult =
  | { status: "saved"; id: string }
  | { status: "limited" }
  | { status: "unavailable" };

/**
 * Salva il messaggio nella sezione "Messaggi" dell'admin. Se la tabella non
 * c'è ancora (migrazione 0012 non eseguita) o il database non risponde, il
 * modulo continua a funzionare come prima, solo con l'email.
 */
async function saveMessage(
  name: string,
  email: string,
  message: string,
): Promise<SaveResult> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase.rpc("submit_contact_message", {
      p_name: name,
      p_email: email,
      p_message: message,
      p_sender_hash: await senderHash(),
    });
    if (error) return { status: "unavailable" };
    if (!data) return { status: "limited" };
    return { status: "saved", id: String(data) };
  } catch {
    return { status: "unavailable" };
  }
}

export async function sendContactMessage(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  // Campo trappola per i bot: invisibile e irraggiungibile da tastiera per
  // una persona reale, ma i bot che compilano automaticamente ogni campo di
  // solito lo riempiono. Se è pieno, fingiamo che sia andato tutto bene
  // senza inviare nulla né avvisare il bot che è stato scoperto.
  const honeypot = String(formData.get("website") || "").trim();
  if (honeypot) {
    return { error: null, success: true };
  }

  // Seconda trappola: il modulo riceve l'ora in cui è comparso sullo
  // schermo. Una persona impiega ben più di 3 secondi a scrivere nome,
  // email e messaggio; un bot no. Se il dato manca (JavaScript spento) non
  // si blocca nessuno.
  const startedAt = Number(formData.get("started_at"));
  if (startedAt && Date.now() - startedAt < 3000) {
    return { error: null, success: true };
  }

  // Il nome finisce nell'oggetto dell'email: niente a capo.
  const name = String(formData.get("name") || "")
    .replace(/[\r\n]+/g, " ")
    .trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name) return { error: "Il nome manca." };
  if (name.length > MAX_NAME) {
    return { error: `Il nome può avere al massimo ${MAX_NAME} caratteri.` };
  }
  if (!email || email.length > MAX_EMAIL || !EMAIL_REGEX.test(email)) {
    return { error: "Email non valida." };
  }
  if (message.length < 10) return { error: "Scrivi almeno due righe." };
  if (message.length > MAX_MESSAGE) {
    return {
      error: `Il messaggio è troppo lungo (massimo ${MAX_MESSAGE} caratteri).`,
    };
  }

  const saved = await saveMessage(name, email, message);
  if (saved.status === "limited") {
    return {
      error:
        "Hai già inviato diversi messaggi poco fa. Li ho ricevuti: riprova tra un'ora, oppure scrivimi su WhatsApp.",
    };
  }

  const settings = await getSiteSettings();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { error } = await resend.emails.send({
    // NOTA PER COSIMO: questo è il mittente di test di Resend. Funziona
    // subito ma consegna solo alla tua email verificata su Resend. Quando
    // avrai un dominio verificato, sostituiscilo con una tua email
    // (es. noreply@tuodominio.it) per poter ricevere da chiunque.
    from: "Sito Portfolio <onboarding@resend.dev>",
    to: settings.contact_email,
    replyTo: email,
    subject: `Nuovo messaggio da ${name}`,
    text: `${message}\n\n— ${name} (${email})`,
  });

  if (!error && saved.status === "saved") {
    await createPublicClient()
      .rpc("mark_contact_email_sent", { p_id: saved.id })
      .then(
        () => undefined,
        () => undefined,
      );
  }

  // Se l'email non parte ma il messaggio è salvato nell'admin, per chi
  // scrive l'invio è riuscito: il messaggio non va perso.
  if (error && saved.status !== "saved") {
    return { error: "Invio non riuscito. Riprova tra poco." };
  }

  return { error: null, success: true };
}

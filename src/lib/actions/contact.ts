"use server";

import { Resend } from "resend";
import { getSiteSettings } from "@/lib/data/settings";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Stessi valori di maxLength in ContactForm (un file "use server" può
// esportare solo funzioni, quindi non si possono condividere da qui).
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

type FormState = { error: string | null; success?: boolean };

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

  if (error) {
    return { error: "Invio non riuscito. Riprova tra poco." };
  }

  return { error: null, success: true };
}

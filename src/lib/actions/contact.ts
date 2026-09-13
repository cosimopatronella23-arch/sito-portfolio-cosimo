"use server";

import { Resend } from "resend";
import { getSiteSettings } from "@/lib/data/settings";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const message = String(formData.get("message") || "").trim();

  if (!name) return { error: "Il nome manca." };
  if (!email || !EMAIL_REGEX.test(email)) {
    return { error: "Email non valida." };
  }
  if (message.length < 10) return { error: "Scrivi almeno due righe." };

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

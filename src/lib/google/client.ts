import { google } from "googleapis";

/**
 * Credenziali dell'account di servizio Google (sola lettura), da
 * Project Settings del progetto Google Cloud. Se mancano, torna null:
 * le pagine che le usano mostrano uno stato "non configurato" invece di
 * andare in errore.
 */
export function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !rawKey) return null;

  // Normalizza la chiave qualunque sia il modo in cui è stata incollata:
  // "\n" scritti come testo, a-capo reali con CRLF, o spazi ai margini.
  const privateKey = rawKey
    .trim()
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n");

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });
}

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
  // virgolette esterne, "\n" scritti come testo, a-capo reali con CRLF.
  let privateKey = rawKey.trim();
  if (privateKey.startsWith('"') && privateKey.endsWith('"')) {
    privateKey = privateKey.slice(1, -1);
  }
  privateKey = privateKey
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .trim();

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });
}

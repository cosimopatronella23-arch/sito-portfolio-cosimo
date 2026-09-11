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

  // Nel .env la chiave ha gli "\n" scritti come testo: vanno trasformati
  // in veri a capo prima di firmare le richieste.
  const privateKey = rawKey.replace(/\\n/g, "\n");

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: [
      "https://www.googleapis.com/auth/analytics.readonly",
      "https://www.googleapis.com/auth/webmasters.readonly",
    ],
  });
}

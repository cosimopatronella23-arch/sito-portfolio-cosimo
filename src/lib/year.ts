/**
 * Scrivendo {anno} in un titolo o in una descrizione per Google, il sito
 * mette da solo l'anno in corso (ora italiana): niente da aggiornare a
 * mano ogni gennaio. Le pagine si rigenerano almeno ogni ora, quindi il
 * cambio arriva entro la prima ora del nuovo anno.
 */
export function withYear(text: string): string;
export function withYear(
  text: string | null | undefined,
): string | null | undefined;
export function withYear(text: string | null | undefined) {
  if (!text || !/\{anno\}/i.test(text)) return text;
  const year = new Intl.DateTimeFormat("it-IT", {
    year: "numeric",
    timeZone: "Europe/Rome",
  }).format(new Date());
  return text.replace(/\{anno\}/gi, year);
}

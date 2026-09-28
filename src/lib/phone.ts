/**
 * Il numero resta salvato come lo scrivi in /admin/impostazioni; qui si
 * decide solo come mostrarlo. Un cellulare italiano scritto "3920824301"
 * diventa "+39 392 082 4301" (leggibile, e con prefisso internazionale per
 * chi chiama dall'estero e per i dati strutturati di Google).
 */
function toInternational(raw: string) {
  const compact = raw.replace(/[\s.\-/()]/g, "");
  if (compact.startsWith("+")) return compact;
  if (compact.startsWith("0039")) return `+${compact.slice(2)}`;
  if (/^39\d{9,10}$/.test(compact)) return `+${compact}`;
  if (/^[03]\d{5,10}$/.test(compact)) return `+39${compact}`;
  return compact;
}

/** Valore per href="tel:...", senza spazi. */
export function phoneHref(raw: string) {
  return `tel:${toInternational(raw)}`;
}

/** Versione leggibile da mostrare sul sito. */
export function formatPhone(raw: string) {
  const intl = toInternational(raw);
  const mobile = intl.match(/^\+39(3\d{2})(\d{3})(\d{3,4})$/);
  if (mobile) return `+39 ${mobile[1]} ${mobile[2]} ${mobile[3]}`;
  // Fissi e numeri esteri: solo il prefisso separato, cifre come inserite.
  const it = intl.match(/^\+39(\d+)$/);
  if (it) return `+39 ${it[1]}`;
  return raw.trim();
}

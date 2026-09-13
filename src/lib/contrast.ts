/**
 * Rapporto di contrasto WCAG tra due colori esadecimali (#rrggbb).
 * Soglie di riferimento: 4.5 = AA per testo normale, 3 = AA per testo grande.
 */
export function contrastRatio(hex1: string, hex2: string): number | null {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  if (l1 === null || l2 === null) return null;

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Dato un colore di sfondo, sceglie testo/bordi chiari o scuri per restare
 * leggibile — usato dai blocchi homepage con sfondo personalizzato per
 * sezione. Torna null se lo sfondo non è impostato (= usa i colori
 * predefiniti del sito, nessun override).
 */
export function pickTextColors(backgroundHex?: string | null) {
  if (!backgroundHex) return null;
  const luminance = relativeLuminance(backgroundHex);
  if (luminance === null) return null;

  const isLight = luminance > 0.4;
  return {
    text: isLight ? "#0b0a10" : "#f6f2ea",
    muted: isLight ? "rgba(11,10,16,0.7)" : "rgba(246,242,234,0.7)",
    border: isLight ? "rgba(11,10,16,0.18)" : "rgba(246,242,234,0.18)",
  };
}

function relativeLuminance(hex: string): number | null {
  const match = /^#([0-9a-fA-F]{6})$/.exec(hex);
  if (!match) return null;

  const int = parseInt(match[1], 16);
  const channels = [(int >> 16) & 255, (int >> 8) & 255, int & 255].map(
    (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    },
  );

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

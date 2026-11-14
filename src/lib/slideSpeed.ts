/**
 * Velocità delle sequenze di immagini ("In sequenza" nella galleria di un
 * progetto), scelta in admin per ogni progetto. Il valore è il tempo in
 * millisecondi tra un'immagine e la successiva.
 */
export const SLIDE_SPEEDS = [
  { ms: 250, label: "Velocissima" },
  { ms: 450, label: "Molto veloce" },
  { ms: 800, label: "Veloce" },
  { ms: 1200, label: "Normale" },
  { ms: 1800, label: "Lenta" },
] as const;

export const DEFAULT_SLIDE_MS = 450;

/** Accetta solo i valori previsti; tutto il resto torna al predefinito. */
export function cleanSlideMs(value: unknown): number | undefined {
  const n = Number(value);
  return SLIDE_SPEEDS.some((s) => s.ms === n) ? n : undefined;
}

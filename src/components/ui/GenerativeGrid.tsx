/**
 * Trama generativa a griglia di colori — ispirata agli sfondi "digitali"
 * degli studi di brand design, fatta solo con un gradiente CSS (nessuna
 * immagine, nessun canvas). Va dietro/sopra un'immagine con mix-blend-mode,
 * così la tinge di colore invece di sostituirla — la foto resta la
 * protagonista, la trama aggiunge solo profondità.
 */
export function GenerativeGrid({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`generative-grid pointer-events-none absolute inset-0 ${className ?? ""}`}
    />
  );
}

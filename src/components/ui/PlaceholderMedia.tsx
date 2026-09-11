import clsx from "clsx";

const COLORS = ["#6d5bd0", "#3f3555", "#b5487a", "#2f5d62"];

/**
 * Placeholder visivo al posto delle immagini reali (cover_image/gallery):
 * colore piatto (a rotazione) invece di un gradiente, con un piccolo numero
 * in basso a sinistra che richiama la numerazione 01/02/03 del resto del sito.
 * In Fase 2, quando carichi le immagini da /admin, questo componente viene
 * sostituito da next/image puntato al file reale su Supabase Storage.
 */
export function PlaceholderMedia({
  index = 0,
  className,
}: {
  index?: number;
  className?: string;
}) {
  const color = COLORS[index % COLORS.length];

  return (
    <div
      className={clsx("relative overflow-hidden", className)}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      <span className="font-display absolute bottom-4 left-5 text-sm font-medium text-white/50">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  );
}

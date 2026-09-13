/**
 * Nastro di testo che scorre all'infinito, firma tipica dei siti da studio
 * di design — puro CSS (nessuna libreria): il contenuto è duplicato due
 * volte e la seconda copia riprende esattamente dove finisce la prima,
 * quindi il loop non ha scatti. Si ferma da sola con prefers-reduced-motion.
 */
export function Marquee({ items }: { items: string[] }) {
  const content = (
    <span className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="font-display px-4 text-2xl font-semibold tracking-tight sm:text-3xl">
            {item}
          </span>
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-3 w-3 shrink-0 fill-accent sm:h-3.5 sm:w-3.5"
          >
            <circle cx="12" cy="12" r="12" />
          </svg>
        </span>
      ))}
    </span>
  );

  return (
    <div
      className="flex w-full overflow-hidden border-y border-border py-5"
      aria-hidden="true"
    >
      <div className="marquee-track flex w-max shrink-0">
        {content}
        {content}
      </div>
    </div>
  );
}

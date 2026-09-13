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
          <span aria-hidden="true" className="text-2xl text-accent sm:text-3xl">
            ✳
          </span>
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

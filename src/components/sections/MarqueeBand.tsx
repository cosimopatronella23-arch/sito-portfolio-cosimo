import type { SectionTheme } from "@/lib/types";

/**
 * Banda sottile con i servizi che scorrono, alternando peso pieno e
 * leggero, separati da un punto nel colore d'accento. Si ferma al passaggio del mouse e con "riduci movimento".
 * Solo CSS: il contenuto è duplicato e il loop non ha scatti.
 */
export function MarqueeBand({
  items,
  theme,
}: {
  items: string[];
  theme: SectionTheme;
}) {
  if (items.length === 0) return null;
  const words = items.length < 4 ? [...items, ...items] : items;
  const content = (
    <span className="flex shrink-0 items-center">
      {words.map((item, i) => (
        <span key={i} className="flex items-center">
          <span
            className={`font-display px-5 text-[clamp(1.25rem,2.2vw,1.75rem)] leading-none tracking-[-0.02em] sm:px-8 ${
              i % 2 === 0 ? "font-bold" : "font-light"
            }`}
          >
            {item}
          </span>
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-accent" />
        </span>
      ))}
    </span>
  );

  return (
    <div
      aria-hidden="true"
      className={`theme-${theme} marquee-pause flex w-full overflow-hidden border-y border-border py-4 sm:py-5`}
    >
      <div className="marquee-track flex w-max shrink-0">
        {content}
        {content}
      </div>
    </div>
  );
}

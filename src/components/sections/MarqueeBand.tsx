import type { SectionTheme } from "@/lib/types";

/**
 * Banda a tutta larghezza con i servizi che scorrono, alternando peso
 * pieno e sottile. Si ferma al passaggio del mouse e con "riduci movimento".
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
            className={`font-display px-6 text-[clamp(2.5rem,6vw,5.5rem)] leading-none tracking-[-0.04em] sm:px-10 ${
              i % 2 === 0 ? "font-bold" : "font-light"
            }`}
          >
            {item}
          </span>
          <svg aria-hidden="true" viewBox="0 0 24 24" className="size-6 shrink-0 fill-current sm:size-10">
            {i % 3 === 0 ? <circle cx="12" cy="12" r="12" /> : i % 3 === 1 ? <rect width="24" height="24" /> : <path d="M0 24A24 24 0 0 1 24 0v24z" />}
          </svg>
        </span>
      ))}
    </span>
  );

  return (
    <div
      aria-hidden="true"
      className={`theme-${theme} marquee-pause flex w-full overflow-hidden border-y border-border-strong py-6 sm:py-8`}
    >
      <div className="marquee-track flex w-max shrink-0">
        {content}
        {content}
      </div>
    </div>
  );
}

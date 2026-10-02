/**
 * Titolo con una freccia finale che indica il link. La freccia resta
 * attaccata all'ultima parola: non finisce mai da sola su una riga nuova.
 */
export function TitleArrow({ text }: { text: string }) {
  const words = text.trim().split(/\s+/);
  const last = words.pop();

  return (
    <>
      {words.length ? `${words.join(" ")} ` : null}
      <span className="whitespace-nowrap">
        {last}
        <span
          aria-hidden="true"
          className="ml-[0.3em] inline-block text-[0.55em] align-middle text-accent transition-transform duration-300 group-hover:translate-x-1"
        >
          →
        </span>
      </span>
    </>
  );
}

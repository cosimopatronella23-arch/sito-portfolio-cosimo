/**
 * Anteprima di come titolo e descrizione appariranno nei risultati di
 * ricerca di Google. Puramente visiva, nessun collegamento al salvataggio:
 * si limita a mostrare live i valori passati dal form che la usa.
 */
export function SerpPreview({
  url,
  title,
  description,
}: {
  url: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col gap-1 border border-border-strong bg-surface p-4">
      <span className="text-xs text-foreground-muted">Anteprima Google</span>
      <div className="flex flex-col gap-0.5 font-sans">
        <span className="truncate text-sm text-success/80">
          {url || "https://cosimopatronella.vercel.app"}
        </span>
        <span className="truncate text-lg text-[#8ab4f8]">
          {title || "Titolo della pagina"}
        </span>
        <span className="line-clamp-2 text-sm text-foreground-muted">
          {description || "La meta description apparirà qui."}
        </span>
      </div>
    </div>
  );
}

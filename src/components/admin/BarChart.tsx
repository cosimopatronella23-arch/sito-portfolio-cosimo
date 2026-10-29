/**
 * Grafico a barre minimale, senza librerie esterne. Le altezze sono
 * percentuali relative al valore più alto della serie.
 */
export function BarChart({
  data,
  formatLabel,
}: {
  data: Array<{ label: string; value: number }>;
  formatLabel?: (label: string) => string;
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const fmt = (label: string) => (formatLabel ? formatLabel(label) : label);
  // Con pochi punti ogni barra ha la sua data; con molti solo la prima e
  // l'ultima, in una riga sotto, così tutte le barre partono dalla stessa
  // linea di base.
  const compact = data.length > 12;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-40 items-end gap-1">
        {data.map((point, i) => (
          <div
            key={`${point.label}-${i}`}
            className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2"
          >
            <span className="pointer-events-none absolute -top-6 hidden text-xs text-foreground group-hover:block">
              {point.value}
            </span>
            <div
              className="w-full bg-accent/70 transition-colors group-hover:bg-accent"
              style={{ height: `${(point.value / max) * 100}%`, minHeight: 2 }}
            />
            {!compact ? (
              <span className="text-[10px] whitespace-nowrap text-foreground-muted">
                {fmt(point.label)}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      {compact && data.length ? (
        <div className="flex justify-between text-[10px] text-foreground-muted">
          <span>{fmt(data[0].label)}</span>
          <span>{fmt(data[data.length - 1].label)}</span>
        </div>
      ) : null}
    </div>
  );
}

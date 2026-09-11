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

  return (
    <div className="flex h-40 items-end gap-1">
      {data.map((point, i) => (
        <div
          key={`${point.label}-${i}`}
          className="group relative flex flex-1 flex-col items-center justify-end gap-2"
        >
          <span className="pointer-events-none absolute -top-6 hidden text-xs text-foreground group-hover:block">
            {point.value}
          </span>
          <div
            className="w-full bg-accent/70 transition-colors group-hover:bg-accent"
            style={{ height: `${(point.value / max) * 100}%`, minHeight: 2 }}
          />
          {data.length <= 12 ? (
            <span className="text-[10px] text-foreground-muted">
              {formatLabel ? formatLabel(point.label) : point.label}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

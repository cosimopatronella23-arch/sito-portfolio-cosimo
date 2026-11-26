/** Intestazione delle pagine dell'admin: sezione del menu, titolo, una
 *  riga che spiega a cosa serve la pagina e, a destra, i pulsanti. */
export function PageHeader({
  crumb,
  title,
  lead,
  actions,
}: {
  crumb?: string;
  title: string;
  lead?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex max-w-2xl flex-col gap-1">
        {crumb ? <p className="text-xs text-foreground-muted">{crumb}</p> : null}
        <h1 className="font-display text-3xl font-semibold tracking-tight">{title}</h1>
        {lead ? <p className="text-sm leading-relaxed text-foreground-muted">{lead}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

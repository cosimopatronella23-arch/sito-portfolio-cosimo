/**
 * Una riga di impostazione come in WordPress: nome e spiegazione a
 * sinistra, campo a destra. Su telefono vanno una sotto l'altro.
 * "htmlFor" collega il nome al campo (clic sul nome = cursore nel campo).
 */
export function FieldRow({
  label,
  help,
  htmlFor,
  children,
}: {
  label: string;
  help?: React.ReactNode;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 border-b border-border py-5 last:border-b-0 md:grid-cols-[15rem_1fr] md:gap-10">
      <div className="flex flex-col gap-1">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-semibold">
            {label}
          </label>
        ) : (
          <span className="text-sm font-semibold">{label}</span>
        )}
        {help ? <p className="text-xs leading-relaxed text-foreground-muted">{help}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Classi dei campi di testo, uguali in tutte le pagine delle impostazioni. */
export const inputClass =
  "w-full min-h-11 border border-border-strong bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none";

/**
 * Sezione pieghevole per il form Impostazioni, via <details>/<summary>
 * nativi: nessun JavaScript aggiuntivo, funziona anche senza React
 * idratato, accessibile di default (tastiera/screen reader inclusi).
 * Puramente visivo — non cambia nomi/campi dei form che contiene.
 */
export function SettingsSection({
  title,
  description,
  defaultOpen = false,
  children,
}: {
  title: string;
  description?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group border border-border-strong [&::details-content]:overflow-hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-sm font-medium marker:content-none [&::-webkit-details-marker]:hidden">
        {title}
        <span
          aria-hidden="true"
          className="text-foreground-muted transition-transform duration-200 group-open:rotate-180"
        >
          ⌄
        </span>
      </summary>
      <div className="flex flex-col gap-6 border-t border-border-strong p-4">
        {description ? (
          <p className="text-sm text-foreground-muted">{description}</p>
        ) : null}
        {children}
      </div>
    </details>
  );
}

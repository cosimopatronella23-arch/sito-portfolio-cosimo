export function AnalyticsEmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-col gap-2 border border-border-strong p-8 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mx-auto max-w-md text-sm text-foreground-muted">
        {message}
      </p>
    </div>
  );
}

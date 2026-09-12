import { listMediaFiles } from "@/lib/actions/media";
import { MediaManager } from "@/components/admin/MediaManager";

export default async function AdminMediaPage() {
  const files = await listMediaFiles();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Media
        </h1>
        <p className="max-w-2xl text-sm text-foreground-muted">
          Tutte le immagini caricate dal sito. Prima di eliminarne una, il
          sistema controlla se è ancora usata da qualche parte e te lo
          segnala — se lo è, cancellarla la farà sparire anche da lì.
        </p>
      </div>
      <MediaManager files={files} />
    </div>
  );
}

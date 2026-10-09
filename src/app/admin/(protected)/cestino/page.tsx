import { getTrashAdmin } from "@/lib/data/history";
import { deleteForever, restoreFromTrash } from "@/lib/actions/history";
import { DeleteButton } from "@/components/admin/DeleteButton";

const TYPE_LABEL = {
  projects: "Progetto",
  blog_posts: "Articolo",
  service_pages: "Servizio",
} as const;

const dateFormat = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function daysLeft(deletedAt: string) {
  const left = 30 - Math.floor((Date.now() - new Date(deletedAt).getTime()) / 864e5);
  return Math.max(left, 0);
}

export default async function AdminTrashPage() {
  const items = await getTrashAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Cestino
        </h1>
        <p className="text-sm text-foreground-muted">
          Progetti, articoli e servizi eliminati restano qui 30 giorni: puoi
          ripristinarli com&apos;erano. Poi spariscono per sempre.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="border border-border px-5 py-10 text-center text-sm text-foreground-muted">
          Il cestino è vuoto.
        </p>
      ) : (
        <ul className="flex flex-col border border-border-strong">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate font-medium">
                  {item.title || "(senza titolo)"}
                </span>
                <span className="text-xs text-foreground-muted">
                  {TYPE_LABEL[item.table_name]} · eliminato il{" "}
                  {dateFormat.format(new Date(item.deleted_at))} · si cancella
                  tra {daysLeft(item.deleted_at)} giorni
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <form action={restoreFromTrash}>
                  <input type="hidden" name="id" value={item.id} />
                  <button
                    type="submit"
                    className="min-h-10 border border-border-strong px-3 hover:border-accent hover:text-accent"
                  >
                    Ripristina
                  </button>
                </form>
                <form action={deleteForever}>
                  <input type="hidden" name="id" value={item.id} />
                  <DeleteButton
                    label="Elimina per sempre"
                    confirmText="Eliminare per sempre? Non si potrà più recuperare."
                  />
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

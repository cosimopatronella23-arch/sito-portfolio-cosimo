"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import { AdminIcon } from "./AdminIcons";
import { DeleteButton } from "./DeleteButton";
import { saveOrder } from "@/lib/actions/reorder";
import { isVideoUrl } from "@/lib/isVideoUrl";

export type ContentListItem = {
  id: string;
  title: string;
  status: string;
  subtitle?: string;
  thumbnail?: string | null;
  badges?: string[];
  editHref: string;
  previewHref?: string;
  publicHref?: string;
};

type Filter = "all" | "published" | "draft";

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "Tutti" },
  { id: "published", label: "Pubblicati" },
  { id: "draft", label: "Bozze" },
];

function StatusBadge({ status }: { status: string }) {
  const published = status === "published";
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 border px-2 py-0.5 text-xs",
        published
          ? "border-success/40 text-success"
          : "border-warning/40 text-warning",
      )}
    >
      <span
        aria-hidden="true"
        className={clsx(
          "h-1.5 w-1.5 rounded-full",
          published ? "bg-success" : "bg-warning",
        )}
      />
      {published ? "Pubblicato" : "Bozza"}
    </span>
  );
}

/**
 * Elenco di contenuti in /admin: ricerca, filtro per stato, azioni e, se
 * previsto, ordine con trascinamento (più pulsanti su/giù per tastiera e
 * telefono). Il nuovo ordine si salva solo con "Salva ordine".
 */
export function ContentList({
  items,
  reorderTable,
  duplicateAction,
  deleteAction,
  emptyText,
}: {
  items: ContentListItem[];
  /** Se presente, l'elenco si può riordinare e salvare su questa tabella. */
  reorderTable?: "projects" | "service_pages";
  duplicateAction: (formData: FormData) => Promise<void>;
  deleteAction: (formData: FormData) => Promise<void>;
  emptyText: string;
}) {
  const router = useRouter();
  const [order, setOrder] = useState(() => items.map((i) => i.id));
  const [savedOrder, setSavedOrder] = useState(order);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [dragging, setDragging] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();

  // Se arrivano dati nuovi dal server (es. dopo Duplica), si riparte da lì.
  const itemsKey = items.map((i) => i.id).join();
  const [lastKey, setLastKey] = useState(itemsKey);
  if (itemsKey !== lastKey) {
    setLastKey(itemsKey);
    setOrder(items.map((i) => i.id));
    setSavedOrder(items.map((i) => i.id));
  }

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);
  const ordered = order.map((id) => byId.get(id)).filter(Boolean) as ContentListItem[];
  const visible = ordered.filter(
    (item) =>
      (filter === "all" || item.status === filter) &&
      item.title.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const filtering = query.trim() !== "" || filter !== "all";
  const canReorder = !!reorderTable && !filtering;
  const orderChanged = order.join() !== savedOrder.join();

  function move(id: string, to: number) {
    setOrder((prev) => {
      const from = prev.indexOf(id);
      if (from === -1 || to < 0 || to >= prev.length || from === to) return prev;
      const next = [...prev];
      next.splice(from, 1);
      next.splice(to, 0, id);
      return next;
    });
    setMessage(null);
  }

  function save() {
    if (!reorderTable) return;
    startSaving(async () => {
      const result = await saveOrder(reorderTable, order);
      if (result.error) {
        setMessage(`Ordine non salvato: ${result.error}`);
      } else {
        setSavedOrder(order);
        setMessage("Ordine salvato. Il sito mostra già il nuovo ordine.");
        router.refresh();
      }
    });
  }

  const counts = {
    all: items.length,
    published: items.filter((i) => i.status === "published").length,
    draft: items.filter((i) => i.status !== "published").length,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div
          role="group"
          aria-label="Filtra per stato"
          className="flex flex-wrap gap-1"
        >
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
              className={clsx(
                "min-h-10 border px-3 text-sm transition-colors",
                filter === f.id
                  ? "border-foreground bg-foreground text-background"
                  : "border-border-strong text-foreground-muted hover:text-foreground",
              )}
            >
              {f.label}{" "}
              <span className="tabular-nums opacity-70">{counts[f.id]}</span>
            </button>
          ))}
        </div>
        <label className="relative sm:w-64">
          <span className="sr-only">Cerca per titolo</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per titolo"
            className="min-h-10 w-full border border-border-strong bg-transparent px-3 text-sm placeholder:text-foreground-muted focus-visible:border-accent focus-visible:outline-none"
          />
        </label>
      </div>

      {reorderTable ? (
        <div
          className={clsx(
            "flex flex-wrap items-center justify-between gap-3 border px-4 py-3 text-sm",
            orderChanged
              ? "border-accent/50 bg-accent/5"
              : "border-border text-foreground-muted",
          )}
        >
          <span role="status" aria-live="polite">
            {message ??
              (filtering
                ? "Per cambiare l'ordine togli ricerca e filtri."
                : orderChanged
                  ? "Hai cambiato l'ordine: salvalo per applicarlo al sito."
                  : "Trascina le righe (o usa le frecce) per cambiare l'ordine sul sito.")}
          </span>
          {orderChanged ? (
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setOrder(savedOrder);
                  setMessage(null);
                }}
                className="min-h-10 border border-border-strong px-3 text-sm hover:border-foreground"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="min-h-10 bg-foreground px-4 text-sm font-medium text-background hover:bg-accent disabled:opacity-50"
              >
                {saving ? "Salvo..." : "Salva ordine"}
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      {visible.length === 0 ? (
        <p className="border border-border px-5 py-10 text-center text-sm text-foreground-muted">
          {items.length === 0 ? emptyText : "Nessun risultato con questi filtri."}
        </p>
      ) : (
        <ul className="flex flex-col border border-border-strong">
          {visible.map((item) => {
            const index = order.indexOf(item.id);
            return (
              <li
                key={item.id}
                draggable={canReorder}
                onDragStart={(e) => {
                  setDragging(item.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragOver={(e) => {
                  if (!dragging || dragging === item.id) return;
                  e.preventDefault();
                  move(dragging, index);
                }}
                onDragEnd={() => setDragging(null)}
                className={clsx(
                  "flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:gap-4",
                  dragging === item.id && "opacity-50",
                )}
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {canReorder ? (
                    <span className="flex shrink-0 items-center">
                      <span
                        aria-hidden="true"
                        className="hidden cursor-grab text-foreground-muted sm:block"
                      >
                        <AdminIcon name="grip" className="h-5 w-5" />
                      </span>
                      <span className="flex flex-col">
                        <button
                          type="button"
                          onClick={() => move(item.id, index - 1)}
                          disabled={index === 0}
                          aria-label={`Sposta su: ${item.title}`}
                          className="flex h-6 w-8 items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-30"
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => move(item.id, index + 1)}
                          disabled={index === order.length - 1}
                          aria-label={`Sposta giù: ${item.title}`}
                          className="flex h-6 w-8 items-center justify-center text-foreground-muted hover:text-foreground disabled:opacity-30"
                        >
                          ↓
                        </button>
                      </span>
                    </span>
                  ) : null}

                  <div className="relative hidden h-12 w-18 shrink-0 overflow-hidden border border-border bg-background sm:block">
                    {item.thumbnail && !isVideoUrl(item.thumbnail) ? (
                      <Image
                        src={item.thumbnail}
                        alt=""
                        fill
                        sizes="72px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>

                  <div className="flex min-w-0 flex-col gap-1">
                    <Link
                      href={item.editHref}
                      className="truncate font-medium hover:text-accent"
                    >
                      {item.title}
                    </Link>
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={item.status} />
                      {item.badges?.map((b) => (
                        <span
                          key={b}
                          className="border border-border-strong px-2 py-0.5 text-xs text-foreground-muted"
                        >
                          {b}
                        </span>
                      ))}
                      {item.subtitle ? (
                        <span className="truncate text-xs text-foreground-muted">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm sm:shrink-0">
                  <Link
                    href={item.editHref}
                    className="text-foreground-muted hover:text-foreground"
                  >
                    Modifica
                  </Link>
                  {item.previewHref ? (
                    <a
                      href={item.previewHref}
                      target="_blank"
                      rel="noopener"
                      className="text-foreground-muted hover:text-foreground"
                    >
                      Anteprima
                    </a>
                  ) : null}
                  {item.publicHref && item.status === "published" ? (
                    <a
                      href={item.publicHref}
                      target="_blank"
                      rel="noopener"
                      className="text-foreground-muted hover:text-foreground"
                    >
                      Vedi online
                    </a>
                  ) : null}
                  <form action={duplicateAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="text-foreground-muted hover:text-foreground"
                    >
                      Duplica
                    </button>
                  </form>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <DeleteButton />
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import clsx from "clsx";
import type { ClientReview } from "@/lib/types";
import { updateReviews } from "@/lib/actions/reviews";
import { AdminIcon } from "./AdminIcons";
import { inputClass } from "./settings/FieldRow";

type Filter = "tutte" | "visibili" | "nascoste";

function emptyReview(): ClientReview {
  return {
    id: crypto.randomUUID(),
    author: "",
    context: "",
    text: "",
    rating: 5,
    date: new Date().toISOString().slice(0, 7),
    project_slug: "",
    also_project_slugs: [],
    visible: true,
  };
}

function monthLabel(date: string) {
  if (!/^\d{4}-\d{2}$/.test(date)) return "";
  return new Date(`${date}-01T12:00:00`).toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

/**
 * Recensioni come i commenti di WordPress: un elenco compatto, una riga per
 * recensione; un clic la apre in un pannello laterale. Ogni modifica
 * (salvataggio, interruttore, ordine, eliminazione) si salva subito.
 */
export function ReviewsManager({
  initial,
  projects,
  googleLink,
}: {
  initial: ClientReview[];
  projects: { slug: string; title: string }[];
  googleLink?: string;
}) {
  const [items, setItems] = useState(initial);
  const [filter, setFilter] = useState<Filter>("tutte");
  const [editing, setEditing] = useState<ClientReview | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  const titleOf = (slug?: string) => projects.find((p) => p.slug === slug)?.title ?? "";
  const counts = {
    tutte: items.length,
    visibili: items.filter((r) => r.visible).length,
    nascoste: items.filter((r) => !r.visible).length,
  };
  const shown = items.filter((r) =>
    filter === "tutte" ? true : filter === "visibili" ? r.visible : !r.visible,
  );

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (editing && !d.open) d.showModal();
    if (!editing && d.open) d.close();
  }, [editing]);

  function persist(next: ClientReview[], okText = "Salvato. Il sito è aggiornato.") {
    setItems(next);
    const fd = new FormData();
    fd.set("reviews", JSON.stringify(next));
    startTransition(async () => {
      const res = await updateReviews({ error: null }, fd);
      setStatus(res.error ? { ok: false, text: res.error } : { ok: true, text: okText });
    });
  }

  function move(id: string, dir: -1 | 1) {
    const i = items.findIndex((r) => r.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  function saveEditing(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    if (!editing.author.trim() || !editing.text.trim()) {
      setStatus({ ok: false, text: "Servono almeno il nome e il testo della recensione." });
      return;
    }
    const exists = items.some((r) => r.id === editing.id);
    persist(exists ? items.map((r) => (r.id === editing.id ? editing : r)) : [...items, editing]);
    setEditing(null);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filtra le recensioni" className="flex gap-5 text-sm">
          {(["tutte", "visibili", "nascoste"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={clsx(
                "min-h-11 border-b-2 capitalize transition-colors",
                filter === f ? "border-accent text-foreground" : "border-transparent text-foreground-muted hover:text-foreground",
              )}
            >
              {f} ({counts[f]})
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {googleLink ? (
            <a href={googleLink} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center border border-border-strong px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent">
              Apri il profilo Google
            </a>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setIsNew(true);
              setEditing(emptyReview());
            }}
            className="inline-flex min-h-11 items-center gap-2 bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-accent"
          >
            <AdminIcon name="plus" className="h-4 w-4" />
            Aggiungi recensione
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="border border-border px-5 py-10 text-center text-sm text-foreground-muted">
          {items.length === 0
            ? "Nessuna recensione ancora. Quando un cliente ne lascia una su Google, aggiungila qui: sul sito la sezione compare da sola."
            : "Nessuna recensione in questo elenco."}
        </p>
      ) : (
        <div className="overflow-x-auto border border-border-strong bg-surface">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="text-[11px] tracking-[0.1em] text-foreground-muted uppercase">
              <tr className="border-b border-border">
                <th scope="col" className="w-14 px-3 py-3 font-medium"><span className="sr-only">Ordine</span></th>
                <th scope="col" className="px-3 py-3 font-medium">Cliente</th>
                <th scope="col" className="px-3 py-3 font-medium">Recensione</th>
                <th scope="col" className="px-3 py-3 font-medium">Stelle</th>
                <th scope="col" className="px-3 py-3 font-medium">Progetto</th>
                <th scope="col" className="px-3 py-3 font-medium">Visibile</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => {
                const i = items.indexOf(r);
                const also = r.also_project_slugs?.length ?? 0;
                return (
                  <tr key={r.id} className="border-b border-border last:border-b-0 hover:bg-surface-hover">
                    <td className="px-3 py-3">
                      <span className="flex flex-col items-center text-foreground-muted">
                        <button type="button" onClick={() => move(r.id, -1)} disabled={i === 0} aria-label={`Sposta ${r.author} più su`} className="flex size-6 items-center justify-center disabled:opacity-20">
                          <span className="block size-0 border-x-4 border-b-[5px] border-x-transparent border-b-current" />
                        </button>
                        <button type="button" onClick={() => move(r.id, 1)} disabled={i === items.length - 1} aria-label={`Sposta ${r.author} più giù`} className="flex size-6 items-center justify-center disabled:opacity-20">
                          <span className="block size-0 border-x-4 border-t-[5px] border-x-transparent border-t-current" />
                        </button>
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsNew(false);
                          setEditing({ ...r });
                        }}
                        className="text-left font-semibold underline-offset-4 hover:text-accent hover:underline"
                      >
                        {r.author}
                      </button>
                      <span className="block text-xs text-foreground-muted">
                        {[r.context, monthLabel(r.date)].filter(Boolean).join(" · ")}
                      </span>
                    </td>
                    <td className="max-w-[22rem] px-3 py-3">
                      <span className="line-clamp-2 text-foreground-muted">&ldquo;{r.text}&rdquo;</span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-accent" aria-label={`${r.rating} stelle su 5`}>
                      {"★".repeat(r.rating)}
                      <span className="text-border-strong">{"★".repeat(5 - r.rating)}</span>
                    </td>
                    <td className="px-3 py-3">
                      {titleOf(r.project_slug) || <span className="text-foreground-muted">nessuno</span>}
                      {also ? <span className="text-foreground-muted"> +{also}</span> : null}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={r.visible}
                        aria-label={`Recensione di ${r.author} visibile sul sito`}
                        onClick={() => persist(items.map((x) => (x.id === r.id ? { ...x, visible: !x.visible } : x)))}
                        className={clsx("relative h-6 w-11 transition-colors", r.visible ? "bg-accent" : "bg-border-strong")}
                      >
                        <span className={clsx("absolute top-1 size-4 transition-[left] duration-200", r.visible ? "left-6 bg-ink" : "left-1 bg-foreground-muted")} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {pending ? (
          <span className="text-foreground-muted">Salvo...</span>
        ) : status ? (
          <span className={status.ok ? "text-success" : "text-error"}>{status.text}</span>
        ) : null}
      </p>

      <dialog
        ref={dialogRef}
        onClose={() => setEditing(null)}
        aria-labelledby="recensione-titolo"
        className="site-dialog fixed inset-y-0 right-0 left-auto m-0 h-full max-h-none w-full max-w-md border-l border-border-strong bg-surface p-0 text-foreground backdrop:bg-black/60"
      >
        {editing ? (
          <form onSubmit={saveEditing} className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 border-b border-border-strong px-6 py-5">
              <h2 id="recensione-titolo" className="font-display text-lg font-semibold">
                {isNew ? "Nuova recensione" : "Modifica recensione"}
              </h2>
              <button type="button" onClick={() => setEditing(null)} className="min-h-11 px-2 text-sm text-foreground-muted hover:text-foreground">
                Chiudi
              </button>
            </div>
            <div className="flex flex-1 flex-col gap-5 overflow-y-auto px-6 py-6">
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Nome
                <input required value={editing.author} onChange={(e) => setEditing({ ...editing, author: e.target.value })} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Ruolo o progetto <span className="font-normal text-foreground-muted">(facoltativo)</span>
                <input value={editing.context} onChange={(e) => setEditing({ ...editing, context: e.target.value })} className={inputClass} />
              </label>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Testo
                <textarea required rows={6} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} className={inputClass} />
                <span className="text-xs font-normal text-foreground-muted">Copialo da Google così com&apos;è.</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Stelle
                  <select value={editing.rating} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} className={inputClass}>
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} su 5
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-semibold">
                  Mese
                  <input type="month" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} className={inputClass} />
                </label>
              </div>
              <label className="flex flex-col gap-1.5 text-sm font-semibold">
                Progetto collegato
                <select
                  value={editing.project_slug}
                  onChange={(e) => setEditing({ ...editing, project_slug: e.target.value, also_project_slugs: (editing.also_project_slugs ?? []).filter((s) => s !== e.target.value) })}
                  className={inputClass}
                >
                  <option value="">Nessuno</option>
                  {projects.map((p) => (
                    <option key={p.slug} value={p.slug}>
                      {p.title}
                    </option>
                  ))}
                </select>
                <span className="text-xs font-normal text-foreground-muted">La recensione compare anche nella pagina del progetto.</span>
              </label>
              {editing.project_slug ? (
                <details className="text-sm">
                  <summary className="min-h-11 cursor-pointer font-semibold">
                    Mostrala anche in altri progetti ({editing.also_project_slugs?.length ?? 0})
                  </summary>
                  <div className="mt-2 flex flex-col gap-2">
                    {projects
                      .filter((p) => p.slug !== editing.project_slug)
                      .map((p) => {
                        const also = editing.also_project_slugs ?? [];
                        return (
                          <label key={p.slug} className="flex min-h-9 items-center gap-2">
                            <input
                              type="checkbox"
                              checked={also.includes(p.slug)}
                              onChange={(e) =>
                                setEditing({
                                  ...editing,
                                  also_project_slugs: e.target.checked ? [...also, p.slug] : also.filter((s) => s !== p.slug),
                                })
                              }
                            />
                            {p.title}
                          </label>
                        );
                      })}
                  </div>
                </details>
              ) : null}
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input type="checkbox" checked={editing.visible} onChange={(e) => setEditing({ ...editing, visible: e.target.checked })} />
                Visibile sul sito
              </label>
            </div>
            <div className="flex gap-3 border-t border-border-strong px-6 py-4">
              <button type="submit" className="min-h-11 flex-1 bg-foreground px-4 text-sm font-semibold text-background transition-colors hover:bg-accent">
                Salva
              </button>
              {!isNew ? (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Eliminare la recensione di ${editing.author}? Non si può annullare.`)) {
                      persist(items.filter((r) => r.id !== editing.id), "Recensione eliminata.");
                      setEditing(null);
                    }
                  }}
                  className="min-h-11 border border-border-strong px-4 text-sm text-foreground-muted transition-colors hover:border-error hover:text-error"
                >
                  Elimina
                </button>
              ) : null}
            </div>
          </form>
        ) : null}
      </dialog>
    </div>
  );
}

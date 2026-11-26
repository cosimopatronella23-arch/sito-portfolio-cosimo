"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import clsx from "clsx";
import { saveSettingsGroups } from "@/lib/actions/siteSettings";
import { AdminIcon, type AdminIconName } from "../AdminIcons";

export type LayoutRow = {
  key: string;
  href: string;
  title: string;
  summary: string;
  icon: AdminIconName;
  /** Campo show_* che la accende/spegne; assente = sempre visibile. */
  field?: string;
  visible: boolean;
  /** Testo del pulsante, se diverso da "Modifica". */
  action?: string;
};

/**
 * Elenco delle sezioni della homepage, come i widget di WordPress: si
 * trascinano per cambiare ordine (o con le frecce), si accendono e
 * spengono con l'interruttore. Ogni cambio si salva subito.
 */
export function HomeLayoutEditor({ hero, rows: initial }: { hero: LayoutRow; rows: LayoutRow[] }) {
  const [rows, setRows] = useState(initial);
  const [dragKey, setDragKey] = useState<string | null>(null);
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  function save(next: LayoutRow[]) {
    setRows(next);
    const fd = new FormData();
    fd.set("groups", "home-layout");
    fd.set("section_order", JSON.stringify(next.map((r) => r.key)));
    for (const r of next) if (r.field) fd.set(r.field, r.visible ? "on" : "off");
    startTransition(async () => {
      const res = await saveSettingsGroups({ error: null }, fd);
      setStatus(res.error ? { ok: false, text: res.error } : { ok: true, text: "Salvato. La homepage è aggiornata." });
    });
  }

  function move(from: number, to: number) {
    if (to < 0 || to >= rows.length || from === to) return;
    const next = [...rows];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    save(next);
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="border border-border-strong bg-surface" aria-label="Sezioni della homepage, nell'ordine del sito">
        <Row row={hero} fixed />
        {rows.map((row, i) => (
          <li
            key={row.key}
            draggable
            onDragStart={() => setDragKey(row.key)}
            onDragEnd={() => setDragKey(null)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const from = rows.findIndex((r) => r.key === dragKey);
              if (from >= 0) move(from, i);
              setDragKey(null);
            }}
            className={clsx("border-t border-border", dragKey === row.key && "opacity-40")}
          >
            <Row
              row={row}
              onUp={i > 0 ? () => move(i, i - 1) : undefined}
              onDown={i < rows.length - 1 ? () => move(i, i + 1) : undefined}
              onToggle={
                row.field
                  ? () => save(rows.map((r) => (r.key === row.key ? { ...r, visible: !r.visible } : r)))
                  : undefined
              }
            />
          </li>
        ))}
      </ul>
      <p role="status" aria-live="polite" className="min-h-5 text-sm">
        {pending ? (
          <span className="text-foreground-muted">Salvo...</span>
        ) : status ? (
          <span className={status.ok ? "text-success" : "text-error"}>{status.text}</span>
        ) : null}
      </p>
    </div>
  );
}

function Row({
  row,
  fixed = false,
  onUp,
  onDown,
  onToggle,
}: {
  row: LayoutRow;
  fixed?: boolean;
  onUp?: () => void;
  onDown?: () => void;
  onToggle?: () => void;
}) {
  const Wrapper = fixed ? "li" : "div";
  return (
    <Wrapper className={clsx("flex flex-wrap items-center gap-4 px-4 py-4 sm:flex-nowrap sm:px-5", !row.visible && "opacity-60")}>
      <span className="flex w-5 flex-col items-center text-foreground-muted" aria-hidden={fixed}>
        {fixed ? null : (
          <>
            <button type="button" onClick={onUp} disabled={!onUp} aria-label={`Sposta ${row.title} più su`} className="flex size-6 items-center justify-center disabled:opacity-20">
              <span className="block size-0 border-x-4 border-b-[5px] border-x-transparent border-b-current" />
            </button>
            <AdminIcon name="grip" className="h-4 w-4 cursor-grab" />
            <button type="button" onClick={onDown} disabled={!onDown} aria-label={`Sposta ${row.title} più giù`} className="flex size-6 items-center justify-center disabled:opacity-20">
              <span className="block size-0 border-x-4 border-t-[5px] border-x-transparent border-t-current" />
            </button>
          </>
        )}
      </span>
      <span className="flex size-11 shrink-0 items-center justify-center border border-border-strong bg-background">
        <AdminIcon name={row.icon} className="h-5 w-5 text-accent" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{row.title}</span>
        <span className="block truncate text-xs text-foreground-muted">{row.summary}</span>
      </span>
      {fixed ? (
        <span className="border border-border-strong px-2 py-1 text-[11px] text-foreground-muted">sempre visibile</span>
      ) : onToggle ? (
        <button
          type="button"
          role="switch"
          aria-checked={row.visible}
          aria-label={`${row.title} visibile sul sito`}
          onClick={onToggle}
          className={clsx(
            "relative h-6 w-11 shrink-0 transition-colors",
            row.visible ? "bg-accent" : "bg-border-strong",
          )}
        >
          <span
            className={clsx(
              "absolute top-1 size-4 bg-ink transition-[left] duration-200",
              row.visible ? "left-6" : "left-1 bg-foreground-muted",
            )}
          />
        </button>
      ) : (
        <span className="w-11 shrink-0" />
      )}
      <Link
        href={row.href}
        className={clsx(
          "inline-flex min-h-10 shrink-0 items-center border px-4 text-sm font-semibold transition-colors",
          fixed
            ? "border-accent bg-accent text-ink hover:bg-foreground hover:border-foreground"
            : "border-border-strong hover:border-accent hover:text-accent",
        )}
      >
        {row.action ?? "Modifica"}
      </Link>
    </Wrapper>
  );
}

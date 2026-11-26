"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { GroupForm } from "../settings/GroupForm";
import { AdminIcon } from "../AdminIcons";

type Device = "computer" | "tablet" | "telefono";
const WIDTHS: Record<Device, number> = { computer: 1440, tablet: 820, telefono: 390 };
const HEIGHTS: Record<Device, number> = { computer: 900, tablet: 1180, telefono: 844 };
// Oltre questa lunghezza l'indirizzo dell'anteprima diventerebbe troppo
// lungo: si mostra la versione salvata e lo si dice.
const MAX_DRAFT = 12000;

/**
 * Editor di una sezione della homepage, come "Personalizza" di WordPress:
 * a sinistra i campi, a destra il sito com'è con le modifiche non ancora
 * salvate (si aggiorna da solo mentre scrivi, mezzo secondo dopo l'ultima
 * modifica). Computer, tablet e telefono si provano senza uscire.
 */
export function HomeCustomizer({
  title,
  groups,
  anchor,
  children,
}: {
  title: string;
  groups: string[];
  /** Sezione da mostrare nell'anteprima (es. "hero", "contact"). */
  anchor: string;
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState("");
  const [tooLong, setTooLong] = useState(false);
  const [device, setDevice] = useState<Device>("computer");

  // Legge i campi del modulo e, se sono cambiati, prepara la bozza da
  // mandare all'anteprima. Un controllo leggero ogni 600 ms copre anche i
  // campi aggiornati dagli editor (immagini, elenchi), che non generano
  // eventi di digitazione.
  useEffect(() => {
    let last = "";
    const read = () => {
      const form = panelRef.current?.querySelector("form");
      if (!form) return;
      const data: Record<string, string> = {};
      new FormData(form).forEach((value, key) => {
        if (typeof value === "string") data[key] = value;
      });
      const json = JSON.stringify(data);
      if (json === last) return;
      const first = last === "";
      last = json;
      if (first) return; // all'apertura l'anteprima è già quella salvata
      const encoded = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
      if (encoded.length > MAX_DRAFT) {
        setTooLong(true);
        return;
      }
      setTooLong(false);
      setDraft(encoded);
    };
    const id = window.setInterval(read, 600);
    read();
    return () => window.clearInterval(id);
  }, []);

  const src = `/admin/anteprima/homepage${draft ? `?bozza=${draft}` : ""}#hs-${anchor}`;

  return (
    // Su computer occupa tutta l'area a destra del menu (come Personalizza),
    // su telefono resta un modulo normale senza anteprima.
    <div className="grid grid-cols-1 lg:fixed lg:inset-y-0 lg:right-0 lg:left-60 lg:z-30 lg:grid-cols-[400px_1fr] lg:bg-background">
      <div
        ref={panelRef}
        className="flex min-h-0 flex-col border border-border-strong bg-surface lg:border-y-0 lg:border-l-0"
      >
        <div className="flex items-center gap-3 border-b border-border-strong px-5 py-4">
          <Link
            href="/admin/homepage"
            aria-label="Torna alle sezioni della homepage"
            className="flex size-11 items-center justify-center border border-border-strong transition-colors hover:border-accent hover:text-accent"
          >
            <AdminIcon name="back" className="h-4 w-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-xs text-foreground-muted">Homepage</p>
            <h1 className="font-display truncate text-lg font-semibold">{title}</h1>
          </div>
        </div>
        <GroupForm groups={groups} compactBar saveLabel="Salva e pubblica">
          <div className="flex flex-col gap-6 px-5 py-6">{children}</div>
        </GroupForm>
      </div>

      <PreviewPane src={src} device={device} onDevice={setDevice} tooLong={tooLong} />
    </div>
  );
}

function PreviewPane({
  src,
  device,
  onDevice,
  tooLong,
}: {
  src: string;
  device: Device;
  onDevice: (d: Device) => void;
  tooLong: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const w = WIDTHS[device];
  const h = HEIGHTS[device];
  const scale = box.w && box.h ? Math.min(1, box.w / w, box.h / h) : 0;

  return (
    <div className="hidden min-h-0 flex-col gap-3 bg-black p-5 lg:flex">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-foreground-muted">
          {tooLong
            ? "Troppi contenuti per l'anteprima dal vivo: la vedrai aggiornata dopo il salvataggio."
            : "Anteprima dal vivo: si aggiorna mentre scrivi. Niente è online finché non salvi."}
        </p>
        <div role="group" aria-label="Dispositivo dell'anteprima" className="flex">
          {(Object.keys(WIDTHS) as Device[]).map((d) => (
            <button
              key={d}
              type="button"
              aria-pressed={device === d}
              onClick={() => onDevice(d)}
              className={clsx(
                "min-h-9 border px-3 text-xs font-semibold capitalize transition-colors",
                device === d
                  ? "border-accent bg-accent text-ink"
                  : "border-border-strong text-foreground-muted hover:text-foreground",
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
      <div ref={boxRef} className="relative min-h-0 flex-1 overflow-hidden">
        {scale ? (
          <iframe
            title="Anteprima della homepage"
            src={src}
            style={{
              width: w,
              height: h,
              transform: `scale(${scale})`,
              left: Math.max(0, (box.w - w * scale) / 2),
            }}
            className="absolute top-0 origin-top-left border border-border-strong bg-background"
          />
        ) : null}
      </div>
    </div>
  );
}

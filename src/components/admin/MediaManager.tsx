"use client";

import { useState } from "react";
import Image from "next/image";
import {
  checkMediaUsage,
  deleteMediaFile,
  type MediaFile,
} from "@/lib/actions/media";
import { isVideoUrl } from "@/lib/isVideoUrl";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Pannello di dettaglio del file selezionato, sulla falsariga della
 * libreria media di WordPress: anteprima grande, nome file, tipo, data,
 * peso, URL copiabile ed eliminazione — tutto in un unico posto invece di
 * dover indovinare l'URL dalla thumbnail.
 */
function MediaDetail({
  file,
  onClose,
  onDelete,
  busy,
  busyLabel,
}: {
  file: MediaFile;
  onClose: () => void;
  onDelete: () => void;
  busy: boolean;
  busyLabel: string | null;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(file.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex flex-col gap-4 border border-border-strong bg-surface p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Dettagli file</span>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-foreground-muted hover:text-foreground"
        >
          Chiudi
        </button>
      </div>

      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden border border-border-strong bg-background">
        {isVideoUrl(file.url) ? (
          <video
            src={file.url}
            controls
            muted
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <Image
            src={file.url}
            alt=""
            fill
            sizes="400px"
            className="object-contain"
          />
        )}
      </div>

      <dl className="flex flex-col gap-2 text-sm">
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-foreground-muted">Nome file</dt>
          <dd className="wrap-anywhere font-medium">{file.name}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-foreground-muted">Tipo</dt>
          <dd>{isVideoUrl(file.url) ? "Video" : "Immagine"}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-foreground-muted">Caricato il</dt>
          <dd>{formatDate(file.createdAt)}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="text-xs text-foreground-muted">Peso</dt>
          <dd>{formatSize(file.size)}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-xs text-foreground-muted">URL del file</dt>
          <dd className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={file.url}
              onFocus={(e) => e.currentTarget.select()}
              className="w-full truncate border border-border-strong bg-background px-2 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="shrink-0 border border-border-strong px-3 py-1.5 text-xs text-foreground transition-colors hover:border-accent hover:text-accent"
            >
              {copied ? "Copiato!" : "Copia"}
            </button>
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className="w-max text-sm text-foreground-muted hover:text-error disabled:opacity-50"
      >
        {busyLabel ?? "Elimina definitivamente"}
      </button>
    </div>
  );
}

/**
 * File manager per il bucket "media": elenca tutte le immagini e i video
 * caricati e permette di eliminare quelli non più necessari. Cliccando su
 * un elemento si apre un pannello di dettaglio (come la libreria media di
 * WordPress) con nome file, URL copiabile, peso e data. Prima di
 * cancellare, controlla se il file è ancora usato da qualche parte sul
 * sito e lo mostra chiaramente — cancellare un file in uso romperebbe la
 * pagina che lo mostra, quindi qui non si procede mai "alla cieca".
 */
export function MediaManager({ files: initialFiles }: { files: MediaFile[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const [checkingName, setCheckingName] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  const selected = files.find((f) => f.name === selectedName) ?? null;

  async function handleDelete(file: MediaFile) {
    setCheckingName(file.name);
    const usages = await checkMediaUsage(file.url);
    setCheckingName(null);

    const label = isVideoUrl(file.url) ? "questo video" : "questa immagine";
    const message =
      usages.length > 0
        ? `Attenzione: ${label} risulta ancora usato in:\n\n${usages.join("\n")}\n\nEliminandolo, sparirà anche da lì. Procedere comunque?`
        : `${label[0].toUpperCase()}${label.slice(1)} non risulta usato da nessuna parte sul sito. Eliminarlo definitivamente?`;

    if (!window.confirm(message)) return;

    setDeletingName(file.name);
    const { error } = await deleteMediaFile(file.name);
    setDeletingName(null);

    if (error) {
      window.alert(`Eliminazione non riuscita: ${error}`);
      return;
    }

    setFiles((prev) => prev.filter((f) => f.name !== file.name));
    setSelectedName((prev) => (prev === file.name ? null : prev));
  }

  if (files.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        Nessun file caricato ancora.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
        {files.map((file) => {
          const isSelected = file.name === selectedName;
          return (
            <button
              key={file.name}
              type="button"
              onClick={() => setSelectedName(file.name)}
              className="flex flex-col gap-2 text-left"
            >
              <div
                className={`relative aspect-square overflow-hidden border bg-surface transition-colors ${
                  isSelected
                    ? "border-accent"
                    : "border-border-strong hover:border-accent"
                }`}
              >
                {isVideoUrl(file.url) ? (
                  <video
                    src={file.url}
                    muted
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Image
                    src={file.url}
                    alt=""
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                )}
              </div>
              <span className="truncate text-xs font-medium">{file.name}</span>
              <span className="text-xs text-foreground-muted">
                {formatSize(file.size)}
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="lg:sticky lg:top-6 lg:self-start">
          <MediaDetail
            file={selected}
            onClose={() => setSelectedName(null)}
            onDelete={() => handleDelete(selected)}
            busy={
              checkingName === selected.name || deletingName === selected.name
            }
            busyLabel={
              checkingName === selected.name
                ? "Controllo..."
                : deletingName === selected.name
                  ? "Elimino..."
                  : null
            }
          />
        </div>
      ) : null}
    </div>
  );
}

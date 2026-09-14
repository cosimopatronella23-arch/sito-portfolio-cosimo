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

/**
 * File manager per il bucket "media": elenca tutte le immagini caricate e
 * permette di eliminare quelle non più necessarie. Prima di cancellare,
 * controlla se il file è ancora usato da qualche parte sul sito e lo
 * mostra chiaramente — cancellare un'immagine in uso romperebbe la pagina
 * che la mostra, quindi qui non si procede mai "alla cieca".
 */
export function MediaManager({ files: initialFiles }: { files: MediaFile[] }) {
  const [files, setFiles] = useState(initialFiles);
  const [checkingName, setCheckingName] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);

  async function handleDelete(file: MediaFile) {
    setCheckingName(file.name);
    const usages = await checkMediaUsage(file.url);
    setCheckingName(null);

    const message =
      usages.length > 0
        ? `Attenzione: questa immagine risulta ancora usata in:\n\n${usages.join("\n")}\n\nEliminandola, sparirà anche da lì. Procedere comunque?`
        : "Questa immagine non risulta usata da nessuna parte sul sito. Eliminarla definitivamente?";

    if (!window.confirm(message)) return;

    setDeletingName(file.name);
    const { error } = await deleteMediaFile(file.name);
    setDeletingName(null);

    if (error) {
      window.alert(`Eliminazione non riuscita: ${error}`);
      return;
    }

    setFiles((prev) => prev.filter((f) => f.name !== file.name));
  }

  if (files.length === 0) {
    return (
      <p className="text-sm text-foreground-muted">
        Nessuna immagine caricata ancora.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
      {files.map((file) => {
        const busy = checkingName === file.name || deletingName === file.name;
        return (
          <div key={file.name} className="flex flex-col gap-2">
            <div className="relative aspect-square overflow-hidden border border-border-strong bg-surface">
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
            <span className="truncate text-xs text-foreground-muted">
              {formatSize(file.size)}
            </span>
            <button
              type="button"
              onClick={() => handleDelete(file)}
              disabled={busy}
              className="w-max text-xs text-foreground-muted hover:text-error disabled:opacity-50"
            >
              {checkingName === file.name
                ? "Controllo..."
                : deletingName === file.name
                  ? "Elimino..."
                  : "Elimina"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

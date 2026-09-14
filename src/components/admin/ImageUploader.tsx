"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { MediaLibraryPicker } from "./MediaLibraryPicker";
import { isVideoUrl } from "@/lib/isVideoUrl";

/**
 * Carica un'immagine (o un video, se `accept` lo permette) sul bucket
 * "media" di Supabase Storage e salva l'URL pubblico in un input nascosto
 * con il `name` passato.
 */
export function ImageUploader({
  name,
  label,
  defaultValue,
  onChange,
  accept = "image/*",
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  onChange?: (url: string) => void;
  accept?: string;
}) {
  const [url, setUrlState] = useState(defaultValue ?? "");
  function setUrl(next: string) {
    setUrlState(next);
    onChange?.(next);
  }
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    // L'attributo "accept" dell'input file è solo un suggerimento per il
    // selettore del sistema operativo: chiunque può comunque trascinare o
    // scegliere un file di tipo diverso. Controlliamo qui il tipo MIME reale
    // prima di caricarlo — evita ad esempio SVG con script incorporati,
    // eseguibili o altri formati non previsti nel bucket pubblico "media".
    const allowed = accept
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    // "image/*" fa eccezione per gli SVG: possono contenere <script> ed
    // eseguirlo se qualcuno apre il file direttamente dal suo URL pubblico.
    const isAllowed =
      file.type !== "image/svg+xml" &&
      allowed.some((pattern) =>
        pattern.endsWith("/*")
          ? file.type.startsWith(pattern.slice(0, -1))
          : file.type === pattern,
      );
    if (!isAllowed) {
      setError("Formato file non supportato.");
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { cacheControl: "3600" });

    if (uploadError) {
      setError("Upload non riuscito. Riprova.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);
    setUrl(data.publicUrl);
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-2">
      {label ? <span className="text-sm font-medium">{label}</span> : null}
      {url ? (
        <div className="relative aspect-video w-full max-w-xs overflow-hidden border border-border-strong">
          {isVideoUrl(url) ? (
            <video
              src={url}
              muted
              loop
              playsInline
              autoPlay
              className="h-full w-full object-cover"
            />
          ) : (
            <Image src={url} alt="" fill sizes="320px" className="object-cover" />
          )}
        </div>
      ) : null}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="border border-border-strong px-4 py-2 text-sm text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {uploading
            ? "Carico..."
            : url
              ? "Cambia file"
              : "Carica immagine"}
        </button>
        <button
          type="button"
          onClick={() => setLibraryOpen(true)}
          className="text-sm text-foreground-muted hover:text-foreground"
        >
          Scegli da libreria
        </button>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-sm text-foreground-muted hover:text-error"
          >
            Rimuovi
          </button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-error">{error}</p> : null}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <input type="hidden" name={name} value={url} />
      {libraryOpen ? (
        <MediaLibraryPicker
          onSelect={(selected) => {
            setUrl(selected);
            setLibraryOpen(false);
          }}
          onClose={() => setLibraryOpen(false)}
        />
      ) : null}
    </div>
  );
}

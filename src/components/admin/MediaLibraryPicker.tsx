"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

/**
 * Pannello che elenca le immagini già caricate sul bucket "media", per
 * riutilizzarle senza ricaricarle. Puramente additivo: non tocca in alcun
 * modo il flusso di upload esistente in ImageUploader.
 */
export function MediaLibraryPicker({
  onSelect,
  onClose,
}: {
  onSelect: (url: string) => void;
  onClose: () => void;
}) {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const supabase = createClient();
      const { data, error: listError } = await supabase.storage
        .from("media")
        .list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });

      if (cancelled) return;

      if (listError || !data) {
        setError("Non riesco a leggere la libreria immagini.");
        setLoading(false);
        return;
      }

      const withUrls = data
        .filter((file) => file.name && !file.name.endsWith("/"))
        .map((file) => ({
          name: file.name,
          url: supabase.storage.from("media").getPublicUrl(file.name).data
            .publicUrl,
        }));

      setImages(withUrls);
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6">
      <div className="flex max-h-[80vh] w-full max-w-2xl flex-col gap-4 overflow-hidden border border-border-strong bg-surface p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Libreria immagini</span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            Chiudi
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-foreground-muted">Carico...</p>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            Nessuna immagine ancora caricata.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
            {images.map((img) => (
              <button
                key={img.name}
                type="button"
                onClick={() => onSelect(img.url)}
                className="relative aspect-square overflow-hidden border border-border-strong transition-colors hover:border-accent"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

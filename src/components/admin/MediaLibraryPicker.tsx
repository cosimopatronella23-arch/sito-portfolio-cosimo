"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { isVideoUrl } from "@/lib/isVideoUrl";

/**
 * Pannello che elenca le immagini e i video già caricati sul bucket
 * "media", per riutilizzarli senza ricaricarli. Puramente additivo: non
 * tocca in alcun modo il flusso di upload esistente in ImageUploader.
 * Miniature grandi, nome file visibile e badge "Video" per distinguere i
 * due tipi: con decine di file tutti uguali in piccolo era impossibile
 * capire cosa si stesse scegliendo.
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
  const [query, setQuery] = useState("");

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return images;
    return images.filter((img) => img.name.toLowerCase().includes(q));
  }, [images, query]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-6">
      <div className="flex max-h-[85vh] w-full max-w-4xl flex-col gap-4 overflow-hidden border border-border-strong bg-surface p-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-medium">Libreria media</span>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-foreground-muted hover:text-foreground"
          >
            Chiudi
          </button>
        </div>

        {images.length > 0 ? (
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca per nome file..."
            className="border border-border-strong bg-background px-3 py-2 text-sm"
          />
        ) : null}

        {loading ? (
          <p className="text-sm text-foreground-muted">Carico...</p>
        ) : error ? (
          <p className="text-sm text-error">{error}</p>
        ) : images.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            Nessun file ancora caricato.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-foreground-muted">
            Nessun file corrisponde a &quot;{query}&quot;.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 overflow-y-auto sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((img) => {
              const video = isVideoUrl(img.url);
              return (
                <button
                  key={img.name}
                  type="button"
                  onClick={() => onSelect(img.url)}
                  className="flex flex-col gap-1.5 text-left"
                >
                  <div className="relative aspect-square overflow-hidden border border-border-strong bg-background transition-colors hover:border-accent">
                    {video ? (
                      <video
                        src={img.url}
                        muted
                        playsInline
                        preload="metadata"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <Image
                        src={img.url}
                        alt=""
                        fill
                        sizes="220px"
                        className="object-cover"
                      />
                    )}
                    {video ? (
                      <span className="absolute top-1.5 left-1.5 bg-background/90 px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                        Video
                      </span>
                    ) : null}
                  </div>
                  <span className="truncate text-xs text-foreground-muted">
                    {img.name}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

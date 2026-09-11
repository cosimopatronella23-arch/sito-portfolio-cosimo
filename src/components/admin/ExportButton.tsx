"use client";

import { useState } from "react";
import { exportSiteData } from "@/lib/actions/backup";

/**
 * Scarica un backup JSON di progetti, articoli e impostazioni. Solo lettura
 * lato server: il download avviene interamente nel browser dell'utente.
 */
export function ExportButton() {
  const [downloading, setDownloading] = useState(false);

  async function handleClick() {
    setDownloading(true);
    try {
      const json = await exportSiteData();
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `backup-sito-${date}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={downloading}
      className="border border-border-strong px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
    >
      {downloading ? "Preparo il file..." : "Scarica backup contenuti"}
    </button>
  );
}

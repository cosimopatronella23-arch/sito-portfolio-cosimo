"use client";

import { useState, useTransition } from "react";
import { revalidateSite } from "@/lib/actions/revalidate";

/**
 * Forza subito l'aggiornamento delle pagine pubbliche, invece di aspettare
 * la revalidation automatica (max 1 ora). Utile dopo una pubblicazione.
 */
export function RevalidateButton() {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function handleClick() {
    setDone(false);
    startTransition(async () => {
      await revalidateSite();
      setDone(true);
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="border border-border-strong px-5 py-2.5 text-sm text-foreground transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
      >
        {isPending ? "Aggiorno..." : "Aggiorna il sito ora"}
      </button>
      {done ? <span className="text-sm text-success">Fatto.</span> : null}
    </div>
  );
}

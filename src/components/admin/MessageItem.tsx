"use client";

import { useState } from "react";
import clsx from "clsx";
import { markMessageOpened } from "@/lib/actions/messages";

/**
 * Un messaggio nell'elenco: chiuso mostra mittente, data e inizio del
 * testo; aperto il messaggio intero e le azioni. Aprirlo lo segna come
 * letto. Usa <details>, quindi funziona anche da tastiera senza altro.
 */
export function MessageItem({
  id,
  unread,
  header,
  children,
}: {
  id: string;
  unread: boolean;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  // Aperto qui = letto subito, senza aspettare il server. Se il server poi
  // lo riporta "da leggere" (pulsante apposito), si riallinea.
  const [isUnread, setIsUnread] = useState(unread);
  const [prevUnread, setPrevUnread] = useState(unread);
  if (unread !== prevUnread) {
    setPrevUnread(unread);
    setIsUnread(unread);
  }

  return (
    <details
      className="group border-b border-border bg-surface last:border-b-0"
      onToggle={(e) => {
        if ((e.currentTarget as HTMLDetailsElement).open && isUnread) {
          setIsUnread(false);
          void markMessageOpened(id);
        }
      }}
    >
      <summary
        className={clsx(
          "flex cursor-pointer list-none items-start gap-3 px-4 py-4 transition-colors hover:bg-surface-hover [&::-webkit-details-marker]:hidden",
          isUnread ? "text-foreground" : "text-foreground-muted",
        )}
      >
        <span
          aria-hidden="true"
          className={clsx(
            "mt-2 size-2 shrink-0 rounded-full",
            isUnread ? "bg-accent" : "bg-transparent",
          )}
        />
        {isUnread ? <span className="sr-only">Da leggere: </span> : null}
        <div className="min-w-0 flex-1">{header}</div>
        <span
          aria-hidden="true"
          className="mt-1 text-foreground-muted transition-transform group-open:rotate-90"
        >
          →
        </span>
      </summary>
      <div className="flex flex-col gap-5 px-4 pb-5 pl-9">{children}</div>
    </details>
  );
}

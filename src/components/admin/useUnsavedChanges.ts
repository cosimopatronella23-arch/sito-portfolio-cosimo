"use client";

import { useEffect, useState, type RefObject } from "react";

const LEAVE_MESSAGE =
  "Hai modifiche non salvate. Vuoi uscire lo stesso? Le modifiche andranno perse.";

/**
 * Segue le modifiche di un modulo e avvisa prima di lasciare la pagina se
 * non sono state salvate (link interni, chiusura della scheda, ricarica).
 *
 * Conta come modifica: digitazione e scelte nei campi, più i campi nascosti
 * aggiornati dagli editor (immagini, galleria, blocchi). Questi ultimi si
 * osservano solo dopo un attimo dal caricamento, quando gli editor hanno
 * finito di inizializzarsi, per non segnalare modifiche mai fatte.
 */
export function useUnsavedChanges(formRef: RefObject<HTMLFormElement | null>) {
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const markDirty = () => setDirty(true);
    form.addEventListener("input", markDirty);
    form.addEventListener("change", markDirty);
    let observer: MutationObserver | null = null;
    const start = window.setTimeout(() => {
      // Solo i campi nascosti degli editor e solo cambi veri. I campi
      // normali si seguono già con gli eventi di digitazione; osservarli
      // qui sarebbe sbagliato, perché dopo il salvataggio la pagina riceve i
      // dati aggiornati e il loro valore di partenza viene riscritto.
      observer = new MutationObserver((records) => {
        if (
          records.some(
            (r) =>
              r.target instanceof HTMLInputElement &&
              r.target.type === "hidden" &&
              r.oldValue !== r.target.getAttribute("value"),
          )
        ) {
          markDirty();
        }
      });
      observer.observe(form, {
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        attributeFilter: ["value"],
      });
    }, 1500);
    return () => {
      form.removeEventListener("input", markDirty);
      form.removeEventListener("change", markDirty);
      window.clearTimeout(start);
      observer?.disconnect();
    };
  }, [formRef]);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    // Link interni dell'admin (menu, "torna all'elenco"...): la navigazione
    // di Next non passa da beforeunload, quindi si chiede qui.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) {
        return;
      }
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement)) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.hash) return;
      if (!window.confirm(LEAVE_MESSAGE)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onBeforeUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirty]);

  return [dirty, setDirty] as const;
}

"use client";

import { useEffect, useId, useRef, type MouseEvent, type RefObject } from "react";

/**
 * Link al sito del cliente, nella scheda dati del progetto. Se si clicca
 * prima di aver sfogliato il lavoro (la fine di galleria e testi non è ancora
 * comparsa a schermo) un piccolo popup chiede conferma: si può andare al sito
 * lo stesso oppure essere accompagnati alle immagini. Senza contenuto da
 * sfogliare (contentRef vuoto) il link si apre subito.
 */
export function SiteLink({
  url,
  label,
  contentRef,
}: {
  url: string;
  /** Dominio mostrato al posto dell'indirizzo intero. */
  label: string;
  contentRef: RefObject<HTMLDivElement | null>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const seenRef = useRef(false);
  const titleId = useId();
  const textId = useId();

  // Controllo solo sullo scorrimento, non al montaggio: arrivando da un altro
  // progetto la pagina può essere per un istante ancora in fondo.
  useEffect(() => {
    seenRef.current = false;
    const check = () => {
      if (hasSeen(contentRef.current)) seenRef.current = true;
    };
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, [url, contentRef]);

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    // Cmd/Ctrl/Maiusc + clic è una scelta precisa: non la si interrompe.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (seenRef.current || hasSeen(contentRef.current)) return;
    e.preventDefault();
    dialogRef.current?.showModal();
  }

  function showProject() {
    dialogRef.current?.close();
    const content = contentRef.current;
    if (!content) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    content.focus({ preventScroll: true });
    content.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-haspopup="dialog"
        data-cursor="link"
        onClick={handleClick}
        className="-my-2 inline-flex items-center gap-2 py-2 underline decoration-accent decoration-1 underline-offset-[6px] transition-colors duration-200 hover:text-accent"
      >
        {label}
        <ExternalIcon />
        <span className="sr-only"> (si apre in una nuova scheda)</span>
      </a>

      <dialog
        ref={dialogRef}
        aria-labelledby={titleId}
        aria-describedby={textId}
        data-lenis-prevent
        // Un clic sullo sfondo scuro arriva al dialog stesso: chiude.
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
        className="site-dialog theme-paper m-auto w-[calc(100%-24px)] max-w-md border-2 border-foreground p-0 text-base font-normal backdrop:bg-black/70"
      >
        <div className="flex flex-col gap-6 p-6 sm:p-8">
          <div className="flex flex-col gap-3">
            <p
              id={titleId}
              className="font-display text-2xl leading-[1.1] font-semibold tracking-[-0.03em] text-balance sm:text-3xl"
            >
              Salti già al finale?
            </p>
            <p id={textId} className="leading-relaxed text-pretty text-foreground-muted">
              Il progetto non l’hai ancora visto: è qui sotto. Vuoi davvero
              andare direttamente al sito senza sapere il resto?
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              autoFocus
              data-cursor="link"
              onClick={showProject}
              className="min-h-12 flex-1 border border-foreground bg-foreground px-5 text-sm font-medium text-background transition-colors duration-200 hover:bg-fill hover:text-ink"
            >
              Mostrami il progetto
            </button>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="link"
              onClick={() => {
                seenRef.current = true;
                dialogRef.current?.close();
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-foreground px-5 text-sm font-medium transition-colors duration-200 hover:bg-foreground hover:text-background"
            >
              Vai al sito
              <ExternalIcon />
              <span className="sr-only"> (si apre in una nuova scheda)</span>
            </a>
          </div>
        </div>
      </dialog>
    </>
  );
}

/** Il contenuto è "visto" quando la sua fine è entrata nello schermo. */
function hasSeen(content: HTMLElement | null) {
  return !content || content.getBoundingClientRect().bottom <= window.innerHeight;
}

// SVG e non "↗": su iOS il carattere diventa un'emoji.
function ExternalIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="square"
    >
      <path d="M4 12L12 4M5.5 4H12v6.5" />
    </svg>
  );
}

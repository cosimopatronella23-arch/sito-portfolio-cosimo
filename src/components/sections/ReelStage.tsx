"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ReelItem } from "./HeroReel";
import { T, createReelGl, type ReelGl } from "./reelGl";

/*
 * Montaggio a schermo intero: i lavori si alternano a tutto schermo con
 * tagli a ritmo, come un showreel.
 * - I primi tagli accelerano (intro), poi parte un ritmo fisso di battute
 *   lunghe e veloci (LOOP).
 * - Le transizioni sono shader WebGL (reelGl.ts): lunghe e cinematografiche
 *   sulle battute lente, secche (glitch, lamelle) su quelle veloci. Se WebGL
 *   non c'è, o il contesto si perde, si usano le maschere CSS (CUTS).
 * - Il mouse sposta l'immagine in parallasse (variabili --px/--py sulla
 *   sezione, usate anche dal titolo).
 * - Il pulsante pausa ferma tutto (WCAG 2.2.2); passare col mouse o col
 *   focus sul nome del lavoro sospende i tagli, così si riesce a cliccarlo.
 * Con "riduci movimento" resta ferma sul primo lavoro.
 */

// Durata (in secondi) per cui resta in scena ogni lavoro. Mai sotto 0,34 s:
// oltre tre cambi al secondo il montaggio diventa un lampeggiamento
// (WCAG 2.3.1), fastidioso e rischioso per chi soffre di fotosensibilità.
const INTRO = [0.7, 0.5, 0.4, 0.34, 0.34, 0.34, 0.55];
const LOOP = [1.3, 0.65, 0.65, 1.3, 0.36, 0.36, 0.36, 0.36, 1.1, 0.55, 0.55];

const FULL_POLY = "polygon(50% -60%, 160% 50%, 50% 160%, -60% 50%)";
const CUTS: { from: string; to: string }[] = [
  { from: "inset(0 100% 0 0)", to: "inset(0 0% 0 0)" },
  { from: "circle(0% at 50% 50%)", to: "circle(80% at 50% 50%)" },
  { from: "inset(100% 0 0 0)", to: "inset(0% 0 0 0)" },
  { from: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)", to: FULL_POLY },
  { from: "inset(0 0 0 100%)", to: "inset(0 0 0 0%)" },
  { from: "circle(0% at 0% 100%)", to: "circle(150% at 0% 100%)" },
  { from: "inset(0 0 100% 0)", to: "inset(0 0 0% 0)" },
  { from: "inset(50% 50% 50% 50%)", to: "inset(0% 0% 0% 0%)" },
];

// Transizioni WebGL per tipo di battuta.
const POOL_LONG = [T.PUSH, T.ZOOM, T.RIPPLE, T.WIPE, T.IRIS];
const POOL_MID = [T.TILES, T.SLATS, T.WIPE];
const POOL_FAST = [T.GLITCH, T.SLATS];

export function ReelStage({ items }: { items: ReelItem[] }) {
  // `anim`: il nome del lavoro rientra con un'animazione solo sulle battute
  // lente; nei tagli rapidi cambia di scatto, come un contatore.
  const [meta, setMeta] = useState({ i: 0, anim: false, n: 0 });
  const [canPlay, setCanPlay] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);
  const syncRef = useRef<() => void>(() => {});
  const layers = useRef<(HTMLDivElement | null)[]>([]);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.closest<HTMLElement>("[data-hero]");
    if (!root || !hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setCanPlay(!reduced);

    // Parallasse col mouse.
    const onMove = (e: PointerEvent) => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty("--px", (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      hero.style.setProperty("--py", (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    };
    const onLeave = () => {
      hero.style.setProperty("--px", "0");
      hero.style.setProperty("--py", "0");
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);

    let index = 0;
    let step = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let running = false;
    let disposed = false;
    let hold = false; // mouse o focus sul nome del lavoro: tagli sospesi
    let softStop: ReturnType<typeof setTimeout> | undefined;
    const show = (to: number, beat: number) =>
      setMeta((m) => ({ i: to, anim: beat >= 0.5, n: m.n + 1 }));

    // --- WebGL (se disponibile) -------------------------------------------
    let engine: ReelGl | null = null;
    const canvas = canvasRef.current;
    let hideTimer: ReturnType<typeof setTimeout> | undefined;
    const imgs = layers.current.map((l) => l?.querySelector("img") as HTMLImageElement);
    const counters = { long: 0, mid: 0, fast: 0 };
    let ro: ResizeObserver | undefined;
    if (canvas && !reduced && imgs.every(Boolean)) {
      engine = createReelGl(
        canvas,
        imgs,
        () => {
          // contesto perso: si torna alle maschere CSS sull'immagine in scena
          engine = null;
          canvas.style.opacity = "0";
          layers.current.forEach((l, i) => {
            if (!l) return;
            l.style.visibility = i === index ? "visible" : "hidden";
            l.style.zIndex = i === index ? "2" : "0";
          });
        },
        () => {
          // prima texture pronta: la tela prende il posto delle immagini DOM
          canvas.style.opacity = "1";
          clearTimeout(hideTimer);
          hideTimer = setTimeout(() => {
            if (!engine) return;
            layers.current.forEach((l) => {
              if (l) l.style.visibility = "hidden";
            });
          }, 450);
          queueMicrotask(() => !disposed && sync());
        },
      );
      if (engine) {
        ro = new ResizeObserver(() => engine?.resize());
        ro.observe(canvas);
      }
    }

    const nextReady = (from: number) => {
      for (let k = 1; k <= items.length; k++) {
        const j = (from + k) % items.length;
        const img = imgs[j];
        const ok = engine ? engine.has(j) : !!img && img.complete && img.naturalWidth > 0;
        if (ok) return j;
      }
      return from;
    };

    const glCut = (to: number, beat: number) => {
      if (!engine) return;
      let type: number;
      let ms: number;
      if (beat >= 1.0) {
        type = POOL_LONG[counters.long++ % POOL_LONG.length];
        ms = Math.min(900, beat * 700);
      } else if (beat >= 0.5) {
        type = POOL_MID[counters.mid++ % POOL_MID.length];
        ms = 520;
      } else {
        type = POOL_FAST[counters.fast++ % POOL_FAST.length];
        ms = Math.max(220, Math.min(320, beat * 900));
      }
      engine.transition(to, type, ms);
      index = to;
      show(to, beat);
    };

    const cutTo = (to: number, beat: number) => {
      const from = index;
      const next = layers.current[to];
      const prev = layers.current[from];
      if (!next || !prev || from === to) return;
      next.style.visibility = "visible";
      next.style.zIndex = "2";
      prev.style.zIndex = "1";
      const dur = Math.min(560, beat * 780);
      const { from: a, to: b } = CUTS[step % CUTS.length];
      const reveal = next.animate([{ clipPath: a }, { clipPath: b }], {
        duration: dur,
        easing: "cubic-bezier(0.76, 0, 0.24, 1)",
        fill: "forwards",
      });
      const img = next.firstElementChild as HTMLElement | null;
      img?.animate([{ transform: "scale(1.3)" }, { transform: "scale(1)" }], {
        duration: beat * 1000 + 500,
        easing: "cubic-bezier(0.16, 1, 0.3, 1)",
      });
      reveal.onfinish = () => {
        reveal.cancel();
        prev.style.visibility = "hidden";
      };
      index = to;
      show(to, beat);
    };

    const loop = () => {
      if (!running) return;
      const beat = step < INTRO.length ? INTRO[step] : LOOP[(step - INTRO.length) % LOOP.length];
      const fire = () => {
        if (!running) return;
        if (hold) {
          timer = setTimeout(fire, 150);
          return;
        }
        const to = nextReady(index);
        if (to !== index) {
          if (engine) glCut(to, beat);
          else cutTo(to, beat);
        }
        step += 1;
        loop();
      };
      timer = setTimeout(fire, beat * 1000);
    };
    const start = () => {
      if (reduced || disposed) return;
      clearTimeout(softStop);
      engine?.start();
      if (running) return;
      running = true;
      loop();
    };
    // `soft`: lascia finire la transizione in corso prima di fermare la tela.
    const stop = (soft = false) => {
      running = false;
      clearTimeout(timer);
      clearTimeout(softStop);
      if (soft) softStop = setTimeout(() => engine?.stop(), 1000);
      else engine?.stop();
    };

    let inView = true;
    const sync = () => {
      if (pausedRef.current) stop(true);
      else if (inView && !document.hidden) start();
      else stop();
    };
    syncRef.current = sync;

    // Mouse o focus sul nome del lavoro: i tagli aspettano.
    const onOver = (e: PointerEvent) => {
      hold = !!(e.target as Element).closest?.(".reel-meta");
    };
    const onOut = () => {
      hold = false;
    };
    const onFocusIn = (e: FocusEvent) => {
      hold = !!(e.target as Element).closest?.(".reel-meta");
    };
    hero.addEventListener("pointerover", onOver);
    hero.addEventListener("pointerleave", onOut);
    hero.addEventListener("focusin", onFocusIn);
    hero.addEventListener("focusout", onOut);
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      sync();
    });
    io.observe(hero);
    document.addEventListener("visibilitychange", sync);
    // Piccola pausa prima del primo taglio: il titolo entra, poi parte il ritmo.
    const kick = setTimeout(sync, 500);

    return () => {
      disposed = true;
      stop();
      clearTimeout(kick);
      clearTimeout(hideTimer);
      clearTimeout(softStop);
      ro?.disconnect();
      engine?.destroy();
      engine = null;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      hero.removeEventListener("pointerover", onOver);
      hero.removeEventListener("pointerleave", onOut);
      hero.removeEventListener("focusin", onFocusIn);
      hero.removeEventListener("focusout", onOut);
    };
  }, [items.length]);

  if (items.length === 0) return null;
  const cur = meta.i;
  const item = items[cur];
  const togglePause = () => {
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    syncRef.current();
  };

  return (
    <div ref={rootRef}>
      {/* Immagini: tutte nel DOM (si caricano subito), una sola visibile. */}
      <div aria-hidden="true" className="reel-stage absolute inset-0 overflow-hidden">
        <div className="reel-parallax absolute inset-0">
          {items.map((it, i) => (
            <div
              key={it.slug}
              ref={(el) => {
                layers.current[i] = el;
              }}
              className="absolute inset-0"
              style={{ visibility: i === 0 ? "visible" : "hidden", zIndex: i === 0 ? 1 : 0 }}
            >
              <Image
                src={it.cover}
                alt={`${it.title}, ${it.category}`}
                fill
                sizes="100vw"
                preload={i === 0}
                loading={i === 1 ? "eager" : undefined}
                fetchPriority={i > 1 ? "low" : undefined}
                className="object-cover"
              />
            </div>
          ))}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 z-[4] h-full w-full opacity-0 transition-opacity duration-300"
          />
        </div>
        {/* Velo: leggero in alto (le immagini restano vive), più scuro in
            basso dove sta il titolo, che deve restare leggibile su qualunque
            copertina. */}
        <div className="absolute inset-0 z-[3] bg-black/35" />
        <div className="absolute inset-0 z-[3] bg-gradient-to-t from-black/85 via-black/50 to-transparent" />
      </div>

      {/* Numero e nome del lavoro in scena; a destra avanzamento e pausa.
          Stanno su fondo nero pieno: sopra le copertine chiare il testo
          piccolo non sarebbe leggibile. */}
      <div className="container-px absolute inset-x-0 top-[100px] z-10 flex items-start justify-between gap-4 sm:top-[108px]">
        <Link
          key={meta.anim ? `${item.slug}-${meta.n}` : "reel-meta"}
          href={`/progetti/${item.slug}`}
          className={`${meta.anim ? "reel-meta-in " : ""}reel-meta group block min-w-0 bg-black px-3 py-2.5 text-sm text-foreground sm:px-4 sm:py-3 sm:text-base`}
        >
          <span className="font-display mt-1 block truncate font-bold tracking-[-0.02em] underline-offset-4 group-hover:underline">
            {item.title} <span aria-hidden="true">→</span>
          </span>
          <span className="block text-xs text-foreground/75">{item.category}</span>
        </Link>
        <div className="flex shrink-0 items-center gap-3 bg-black px-3 py-2.5 sm:py-3">
          <div aria-hidden="true" className="hidden gap-1 sm:flex">
            {items.map((it, i) => (
              <span
                key={it.slug}
                className={`h-0.5 w-5 transition-colors duration-200 ${
                  i === cur ? "bg-accent" : "bg-foreground/30"
                }`}
              />
            ))}
          </div>
          {canPlay ? (
            <button
              type="button"
              onClick={togglePause}
              aria-label={paused ? "Riprendi il montaggio dei lavori" : "Metti in pausa il montaggio dei lavori"}
              className="flex size-9 items-center justify-center border border-foreground/40 text-foreground transition-colors duration-200 hover:border-foreground hover:bg-foreground hover:text-background"
            >
              {paused ? (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 1l9 5-9 5z" fill="currentColor" />
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
                  <path d="M2 1h3v10H2zM7 1h3v10H7z" fill="currentColor" />
                </svg>
              )}
            </button>
          ) : null}
        </div>
      </div>

      {/* Elenco dei lavori per tastiera, screen reader e Google. */}
      <ul className="sr-only">
        {items.map((it) => (
          <li key={it.slug}>
            <Link href={`/progetti/${it.slug}`}>
              {it.title}, {it.category}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

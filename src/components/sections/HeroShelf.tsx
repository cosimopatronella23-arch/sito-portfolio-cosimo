"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { ReelItem } from "./HeroReel";

/**
 * Lavori dell'hero come copertine in 3D: ogni copertina è una scatola vera
 * (fronte e dorso sui due lati), non un'immagine piatta inclinata.
 *
 * - Computer e tablet ("scaffale"): fila che scorre piano da sola; ai lati
 *   le copertine si aprono verso chi guarda, al centro si mettono di taglio
 *   e si vede il dorso. Al passaggio del mouse (o con Tab) la copertina si
 *   gira di fronte e le altre si abbassano.
 * - Telefono ("sfoglia"): una copertina grande al centro e le vicine di
 *   sbieco ai lati; si sfoglia una alla volta (dito o frecce), avanza da
 *   sola ogni pochi secondi, sotto il nome del progetto in primo piano.
 *
 * Sempre: pausa (WCAG 2.2.2), niente movimento automatico con "riduci
 * movimento", nessun ridisegno di React a ogni fotogramma (le posizioni si
 * scrivono direttamente sugli elementi).
 */

const SPEED = 26; // px al secondo, scorrimento automatico dello scaffale
const MAX_ANGLE = 84; // gradi al centro dello scaffale (quasi di taglio)
const FLOW_ANGLE = 52; // gradi delle copertine vicine nello sfoglia
const FLOW_HOLD = 3.4; // secondi su ogni copertina nello sfoglia
const DRAG_THRESHOLD = 6;

type Mode = "shelf" | "flow";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function HeroShelf({ items }: { items: ReelItem[] }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const [mode, setMode] = useState<Mode>("shelf");
  const [copies, setCopies] = useState(2);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);

  const s = useRef({
    mode: "shelf" as Mode,
    pos: 0,
    vel: 0,
    target: null as number | null,
    slot: 140,
    width: 1200,
    hover: -1,
    open: [] as number[],
    dragging: false,
    pointerId: -1,
    startX: 0,
    startPos: 0,
    lastX: 0,
    lastT: 0,
    moved: false,
    paused: false,
    reduce: false,
    hold: 0,
    active: 0,
  });

  useEffect(() => {
    s.current.paused = paused;
  }, [paused]);
  useEffect(() => {
    s.current.reduce = !!reduce;
  }, [reduce]);

  const total = items.length * copies;

  // Misure e modalità. --slot è un clamp(): si legge dalla larghezza di un
  // elemento invisibile che lo usa. Le copie servono a coprire lo schermo
  // senza che si veda il punto in cui la fila ricomincia.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const mq = window.matchMedia("(max-width: 639px)");
    const measure = () => {
      const m: Mode = mq.matches ? "flow" : "shelf";
      const slot = measureRef.current?.offsetWidth || 140;
      const width = root.clientWidth;
      const st = s.current;
      if (st.mode !== m || st.slot !== slot) {
        // Al cambio di misura si riallinea alla copertina più vicina.
        st.pos = Math.round(st.pos / st.slot) * slot;
        st.target = null;
      }
      st.mode = m;
      st.slot = slot;
      st.width = width;
      setMode(m);
      setCopies(
        m === "flow"
          ? Math.max(1, Math.ceil(5 / items.length))
          : Math.max(1, Math.ceil((width + slot * 6) / (items.length * slot))),
      );
      setReady(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [items.length]);

  // Ciclo di animazione.
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !ready) return;
    const st = s.current;
    st.open = Array.from({ length: total }, (_, i) => st.open[i] ?? 0);
    let raf = 0;
    let last = performance.now();
    let visible = true;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const { slot, width } = st;
      const loop = total * slot;
      const flow = st.mode === "flow";

      // Movimento.
      if (st.target !== null) {
        const diff = st.target - st.pos;
        st.pos += diff * Math.min(1, dt * (st.reduce ? 30 : 7));
        if (Math.abs(diff) < 0.5) {
          st.pos = st.target;
          st.target = null;
        }
      } else if (!st.dragging) {
        if (Math.abs(st.vel) > 1 && !flow) {
          st.pos += st.vel * dt;
          st.vel *= Math.pow(0.04, dt);
        } else if (flow) {
          st.vel = 0;
          const snapped = Math.round(st.pos / slot) * slot;
          if (Math.abs(snapped - st.pos) > 0.5) st.target = snapped;
          else if (!st.paused && !st.reduce) {
            st.hold += dt;
            if (st.hold > FLOW_HOLD) {
              st.hold = 0;
              st.target = snapped + slot;
            }
          }
        } else {
          st.vel = 0;
          if (!st.paused && !st.reduce && st.hover < 0) st.pos += SPEED * dt;
        }
      }

      const half = width / 2;
      for (let i = 0; i < total; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const x = mod(i * slot - st.pos + loop / 2, loop) - loop / 2;

        if (flow) {
          const n = Math.max(-1.6, Math.min(1.6, x / slot));
          const a = Math.abs(n);
          const angle = -n * FLOW_ANGLE * Math.min(1, a);
          card.style.transform = `translate3d(${x * 0.8}px,0,${-Math.min(1, a) * 190}px) rotateY(${angle}deg)`;
          card.style.zIndex = String(100 - Math.round(a * 10));
          card.style.visibility = a > 1.55 ? "hidden" : "visible";
          card.style.setProperty("--shade", String(Math.min(0.6, a * 0.45)));
          continue;
        }

        const d = Math.max(-1.2, Math.min(1.2, x / half));
        const k = Math.max(0, 1 - Math.abs(d));
        const base = Math.sign(d || 1) * MAX_ANGLE * Math.pow(k, 1.5);
        const want = st.hover === i ? 1 : 0;
        st.open[i] += (want - st.open[i]) * Math.min(1, dt * (st.reduce ? 60 : 9));
        const o = st.open[i];
        const angle = base * (1 - o);
        const dim = st.hover >= 0 && st.hover !== i ? 0.55 : 0;
        const shade = Math.abs(Math.sin((angle * Math.PI) / 180)) * 0.5;
        card.style.transform = `translate3d(${x}px,0,${o * 70}px) rotateY(${angle}deg)`;
        card.style.zIndex = String(o > 0.05 ? 50 : Math.round((1 - k) * 20));
        card.style.visibility = Math.abs(d) > 1.15 ? "hidden" : "visible";
        card.style.setProperty("--shade", String(Math.max(shade, dim) * (1 - o)));
        const label = labelRefs.current[i];
        if (label) {
          label.style.transform = `translate3d(${x}px,0,0)`;
          label.style.opacity = String(Math.abs(d) > 1 ? 0 : st.hover >= 0 && st.hover !== i ? 0.35 : 1);
        }
      }

      if (flow) {
        const idx = mod(Math.round(st.pos / slot), total) % items.length;
        if (idx !== st.active) {
          st.active = idx;
          setActive(idx);
        }
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(root);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    start();
    return () => {
      stop();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [ready, total, items.length]);

  // Rotellina/trackpad: solo lo scorrimento orizzontale, quello verticale
  // resta alla pagina.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      const st = s.current;
      st.target = null;
      st.vel = 0;
      st.hold = 0;
      st.pos += e.deltaX;
    };
    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, []);

  function onPointerDown(e: React.PointerEvent) {
    if (e.button !== 0) return;
    const st = s.current;
    st.pointerId = e.pointerId;
    st.startX = st.lastX = e.clientX;
    st.startPos = st.pos;
    st.lastT = performance.now();
    st.moved = false;
    st.vel = 0;
    st.hold = 0;
  }

  function onPointerMove(e: React.PointerEvent) {
    const st = s.current;
    if (st.pointerId !== e.pointerId) return;
    const dx = e.clientX - st.startX;
    if (!st.dragging && Math.abs(dx) > DRAG_THRESHOLD) {
      st.dragging = true;
      st.moved = true;
      st.hover = -1;
      st.target = null;
      st.startPos = st.pos;
      st.startX = e.clientX;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (!st.dragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - st.lastT) / 1000;
    st.vel = (-(e.clientX - st.lastX) / dt) * 0.8;
    st.lastX = e.clientX;
    st.lastT = now;
    // Nello sfoglia il dito sposta la copertina un po' meno della distanza
    // percorsa, così il gesto resta controllato.
    st.pos = st.startPos - (e.clientX - st.startX) * (st.mode === "flow" ? 1.1 : 1);
  }

  function onPointerUp(e: React.PointerEvent) {
    const st = s.current;
    if (st.pointerId !== e.pointerId) return;
    st.pointerId = -1;
    if (!st.dragging) return;
    st.dragging = false;
    if (performance.now() - st.lastT > 80) st.vel = 0;
    if (st.mode === "flow") {
      // Un gesto veloce porta alla copertina successiva anche se breve.
      const fling = Math.abs(st.vel) > 250 ? Math.sign(st.vel) * st.slot * 0.5 : 0;
      st.target = Math.round((st.pos + fling) / st.slot) * st.slot;
      st.vel = 0;
    }
  }

  function step(dir: 1 | -1) {
    const st = s.current;
    const n = st.mode === "flow" ? 1 : Math.max(1, Math.round(st.width / st.slot / 3));
    const from = st.target ?? st.pos;
    st.vel = 0;
    st.hold = 0;
    st.target = Math.round((from + dir * n * st.slot) / st.slot) * st.slot;
  }

  function xOf(i: number) {
    const st = s.current;
    const loop = total * st.slot;
    return mod(i * st.slot - st.pos + loop / 2, loop) - loop / 2;
  }

  // Con Tab la copertina si gira e, se è vicina al bordo, entra nello schermo.
  function onCardFocus(i: number) {
    const st = s.current;
    const x = xOf(i);
    if (st.mode === "flow") {
      st.target = st.pos + x;
      st.hold = 0;
      return;
    }
    st.hover = i;
    const limit = st.width / 2 - st.slot * 1.5;
    if (Math.abs(x) > limit) st.target = st.pos + x - Math.sign(x) * limit;
  }

  const cards = Array.from({ length: total }, (_, i) => ({
    item: items[i % items.length],
    i,
    clone: i >= items.length,
  }));
  const current = items[active] ?? items[0];
  const flow = mode === "flow";

  const controls = (
    <div className="theme-ink pointer-events-auto flex border border-border-strong bg-background/70! backdrop-blur-md">
      <ShelfButton label="Lavoro precedente" onClick={() => step(-1)}>
        <path d="M10 3 5 8l5 5" />
      </ShelfButton>
      <ShelfButton
        label={paused ? "Riprendi lo scorrimento" : "Metti in pausa lo scorrimento"}
        onClick={() => setPaused((p) => !p)}
        className="border-x border-border-strong"
      >
        {paused ? <path d="M5 3v10l8-5z" fill="currentColor" stroke="none" /> : <path d="M6 3v10M10 3v10" />}
      </ShelfButton>
      <ShelfButton label="Lavoro successivo" onClick={() => step(1)}>
        <path d="m6 3 5 5-5 5" />
      </ShelfButton>
    </div>
  );

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carosello"
      aria-label="Lavori recenti"
      className="hero-shelf relative flex h-full max-h-[calc(var(--slot)*3.6+4rem)] min-h-0 w-full touch-pan-y flex-col select-none [--depth:calc(var(--slot)*0.09)] [--slot:58vw] max-sm:max-h-[calc(var(--slot)*1.9+5rem)] sm:[--depth:calc(var(--slot)*0.15)] sm:[--slot:clamp(110px,min(18vw,19svh),200px)]"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={(e) => {
        if (s.current.moved) {
          e.preventDefault();
          e.stopPropagation();
          s.current.moved = false;
        }
      }}
      onMouseLeave={() => {
        s.current.hover = -1;
      }}
    >
      <span ref={measureRef} aria-hidden="true" className="pointer-events-none invisible absolute h-0 w-[var(--slot)]" />

      {/* Scaffale: titoli dritti sopra ogni copertina, seguono lo scorrimento. */}
      {!flow ? (
        <div
          aria-hidden="true"
          className={`relative h-16 shrink-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          {cards.map(({ item, i }) => (
            <div
              key={`l${i}`}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute top-0 left-1/2 -ml-[calc(var(--slot)/2)] flex w-[var(--slot)] flex-col gap-0.5 pr-2 transition-opacity duration-300 will-change-transform"
            >
              <span className="line-clamp-2 text-xs leading-tight font-semibold text-foreground">
                {item.title}
              </span>
              <span className="truncate text-[11px] text-foreground-muted">{item.category}</span>
              <span className="mt-1.5 block size-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-foreground-muted" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Copertine 3D, sfumate ai bordi. */}
      <div
        className={`relative min-h-0 flex-1 transition-opacity duration-700 [perspective:1000px] max-sm:[perspective:800px] sm:[mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] ${ready ? "opacity-100" : "opacity-0"}`}
      >
        {cards.map(({ item, i, clone }) => (
          <Link
            key={`c${i}`}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            href={`/progetti/${item.slug}`}
            data-cursor="link"
            aria-label={clone ? undefined : `${item.title}, ${item.category}`}
            aria-hidden={clone ? true : undefined}
            tabIndex={clone ? -1 : undefined}
            draggable={false}
            onMouseEnter={() => {
              if (!s.current.dragging && s.current.mode === "shelf") s.current.hover = i;
            }}
            onFocus={() => onCardFocus(i)}
            onBlur={() => {
              s.current.hover = -1;
            }}
            onClick={(e) => {
              // Nello sfoglia, toccare una copertina laterale la porta al
              // centro; solo quella al centro apre il progetto.
              const st = s.current;
              if (st.mode === "flow" && Math.abs(xOf(i)) > st.slot * 0.3) {
                e.preventDefault();
                st.target = st.pos + xOf(i);
                st.hold = 0;
              }
            }}
            className="absolute inset-y-0 left-1/2 -ml-[calc(var(--slot)*0.65)] my-auto block h-full w-[calc(var(--slot)*1.3)] outline-offset-4 will-change-transform [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-accent max-sm:-ml-[calc(var(--slot)*0.5)] max-sm:h-[min(100%,calc(var(--slot)*1.3))] max-sm:w-[var(--slot)]"
          >
            {/* Fronte */}
            <span className="absolute inset-0 overflow-hidden bg-surface [backface-visibility:hidden] [transform:translateZ(calc(var(--depth)/2))]">
              <Image
                src={item.cover}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 640px) 18vw, 60vw"
                loading={i < 8 ? "eager" : "lazy"}
                className="pointer-events-none object-cover"
              />
              {/* Luce: un filo chiaro sul bordo e un velo che scurisce la
                  copertina quando si gira di taglio. */}
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.14),transparent_8%,transparent_92%,rgb(0_0_0/0.25))]" />
              <span aria-hidden="true" className="absolute inset-0 bg-black opacity-[var(--shade,0)]" />
            </span>
            {/* Dorso sinistro e destro: una striscia della copertina, più scura. */}
            {(["left", "right"] as const).map((side) => (
              <span
                key={side}
                aria-hidden="true"
                className={`absolute inset-y-0 w-[var(--depth)] overflow-hidden bg-surface [backface-visibility:hidden] ${
                  side === "left"
                    ? "left-[calc(var(--depth)/-2)] [transform:rotateY(-90deg)]"
                    : "left-[calc(100%-var(--depth)/2)] [transform:rotateY(90deg)]"
                }`}
              >
                <Image
                  src={item.cover}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(min-width: 640px) 18vw, 60vw"
                  loading={i < 8 ? "eager" : "lazy"}
                  className={`pointer-events-none object-cover ${side === "left" ? "object-left" : "object-right"}`}
                />
                <span className="absolute inset-0 bg-[linear-gradient(90deg,rgb(0_0_0/0.55),rgb(0_0_0/0.25)_50%,rgb(0_0_0/0.55))]" />
              </span>
            ))}
            {/* Niente retro: le copertine non girano mai oltre i 90 gradi, e
                in Safari una faccia girata di 180 gradi copriva tutto. */}
          </Link>
        ))}

        {!flow ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-5 z-[60] flex justify-center">
            {controls}
          </div>
        ) : null}
      </div>

      {/* Sfoglia: nome del lavoro in primo piano e comandi sotto le copertine. */}
      {flow ? (
        <div className="container-px flex shrink-0 items-end justify-between gap-4 pt-4">
          <p aria-live="polite" className="min-w-0">
            <span key={active} className="reel-caption block">
              <span className="block truncate text-sm font-semibold text-foreground">{current.title}</span>
              <span className="block truncate text-xs text-foreground-muted">{current.category}</span>
            </span>
          </p>
          {controls}
        </div>
      ) : null}
    </div>
  );
}

function ShelfButton({
  label,
  onClick,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      onPointerDown={(e) => e.stopPropagation()}
      className={`group flex size-11 items-center justify-center text-foreground transition-colors duration-300 hover:bg-foreground hover:text-background ${className}`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="size-4 transition-transform duration-300 group-active:scale-90"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="square"
      >
        {children}
      </svg>
    </button>
  );
}

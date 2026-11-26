"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { ReelItem } from "./HeroReel";

/**
 * "Scaffale" dei lavori nell'hero: le copertine dei progetti in fila, in
 * prospettiva. Ognuna ruota in base a dove si trova: ai lati si apre verso
 * chi guarda, al centro si mette di taglio come il dorso di un disco. La
 * fila scorre piano da sola, si trascina col dito o col mouse, si sposta
 * con le frecce e si mette in pausa (WCAG 2.2.2). Al passaggio del mouse
 * (o col tasto Tab) la copertina si apre del tutto e le altre si abbassano.
 *
 * Le posizioni si calcolano in un unico ciclo di animazione e si scrivono
 * direttamente sugli elementi, senza ridisegnare React a ogni fotogramma.
 */

const SPEED = 26; // px al secondo, scorrimento automatico
const MAX_ANGLE = 84; // gradi di rotazione al centro (quasi di taglio)
const DRAG_THRESHOLD = 6;

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function HeroShelf({ items }: { items: ReelItem[] }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const [copies, setCopies] = useState(2);
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  // Stato del movimento: fuori da React, letto dal ciclo di animazione.
  const s = useRef({
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
  });

  useEffect(() => {
    s.current.paused = paused;
  }, [paused]);
  useEffect(() => {
    s.current.reduce = !!reduce;
  }, [reduce]);

  const total = items.length * copies;

  // Misure: larghezza dello slot (dal CSS) e copie necessarie a coprire lo
  // schermo senza che si veda il punto in cui la fila ricomincia.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const measure = () => {
      // --slot è un clamp(): lo si legge dalla larghezza di un elemento
      // invisibile che lo usa, non dalla variabile (che resta testo).
      const slot = measureRef.current?.offsetWidth || 140;
      const width = root.clientWidth;
      s.current.slot = slot;
      s.current.width = width;
      setCopies(Math.max(1, Math.ceil((width + slot * 6) / (items.length * slot))));
      setReady(true);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    return () => ro.disconnect();
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

      if (st.target !== null) {
        const diff = st.target - st.pos;
        st.pos += diff * Math.min(1, dt * 7);
        if (Math.abs(diff) < 0.5) {
          st.pos = st.target;
          st.target = null;
        }
      } else if (!st.dragging) {
        if (Math.abs(st.vel) > 1) {
          st.pos += st.vel * dt;
          st.vel *= Math.pow(0.04, dt);
        } else {
          st.vel = 0;
          if (!st.paused && !st.reduce && st.hover < 0) st.pos += SPEED * dt;
        }
      }

      const half = width / 2;
      for (let i = 0; i < total; i++) {
        const card = cardRefs.current[i];
        const label = labelRefs.current[i];
        if (!card) continue;
        // Centro dello slot rispetto al centro dello scaffale.
        const x = mod(i * slot - st.pos + loop / 2, loop) - loop / 2;
        const d = Math.max(-1.2, Math.min(1.2, x / half));
        const k = Math.max(0, 1 - Math.abs(d));
        const base = Math.sign(d || 1) * MAX_ANGLE * Math.pow(k, 1.5);
        const want = st.hover === i ? 1 : 0;
        st.open[i] += (want - st.open[i]) * Math.min(1, dt * (st.reduce ? 60 : 9));
        const o = st.open[i];
        const angle = base * (1 - o);
        const dim = st.hover >= 0 && st.hover !== i ? 0.45 : 1;
        card.style.transform = `translate3d(${x}px,0,${o * 60}px) rotateY(${angle}deg)`;
        card.style.zIndex = String(o > 0.05 ? 50 : Math.round((1 - k) * 20));
        card.style.opacity = String(dim + (1 - dim) * o);
        card.style.setProperty("--shade", String(Math.abs(Math.sin((angle * Math.PI) / 180)) * 0.55));
        if (label) {
          label.style.transform = `translate3d(${x}px,0,0)`;
          label.style.opacity = String(Math.abs(d) > 1 ? 0 : st.hover >= 0 && st.hover !== i ? 0.35 : 1);
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
  }, [ready, total]);

  // Rotellina/trackpad: solo lo scorrimento orizzontale, quello verticale
  // resta alla pagina.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      s.current.target = null;
      s.current.vel = 0;
      s.current.pos += e.deltaX;
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
    st.target = null;
  }

  function onPointerMove(e: React.PointerEvent) {
    const st = s.current;
    if (st.pointerId !== e.pointerId) return;
    const dx = e.clientX - st.startX;
    if (!st.dragging && Math.abs(dx) > DRAG_THRESHOLD) {
      st.dragging = true;
      st.moved = true;
      st.hover = -1;
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }
    if (!st.dragging) return;
    const now = performance.now();
    const dt = Math.max(1, now - st.lastT) / 1000;
    st.vel = (-(e.clientX - st.lastX) / dt) * 0.8;
    st.lastX = e.clientX;
    st.lastT = now;
    st.pos = st.startPos - dx;
  }

  function onPointerUp(e: React.PointerEvent) {
    const st = s.current;
    if (st.pointerId !== e.pointerId) return;
    st.pointerId = -1;
    st.dragging = false;
    if (performance.now() - st.lastT > 80) st.vel = 0;
  }

  function step(dir: 1 | -1) {
    const st = s.current;
    const jump = Math.max(1, Math.round(st.width / st.slot / 3)) * st.slot;
    const from = st.target ?? st.pos;
    st.vel = 0;
    st.target = Math.round((from + dir * jump) / st.slot) * st.slot;
  }

  // Con Tab la copertina si apre e, se è vicina al bordo, la fila la porta
  // dentro lo schermo.
  function onCardFocus(i: number) {
    const st = s.current;
    st.hover = i;
    const loop = total * st.slot;
    const x = mod(i * st.slot - st.pos + loop / 2, loop) - loop / 2;
    const limit = st.width / 2 - st.slot * 1.5;
    if (Math.abs(x) > limit) st.target = st.pos + x - Math.sign(x) * limit;
  }

  const cards = Array.from({ length: total }, (_, i) => ({
    item: items[i % items.length],
    i,
    clone: i >= items.length,
  }));

  return (
    <div
      ref={rootRef}
      role="region"
      aria-roledescription="carosello"
      aria-label="Lavori recenti"
      className="hero-shelf relative flex h-full max-h-[calc(var(--slot)*3.6+4rem)] min-h-0 w-full touch-pan-y flex-col select-none [--slot:clamp(76px,21vw,110px)] sm:[--slot:clamp(110px,min(18vw,19svh),200px)]"
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

      {/* Titoli sopra le copertine: restano dritti e seguono lo scorrimento. */}
      <div
        aria-hidden="true"
        className={`relative h-14 shrink-0 transition-opacity duration-700 sm:h-16 ${ready ? "opacity-100" : "opacity-0"}`}
      >
        {cards.map(({ item, i }) => (
          <div
            key={`l${i}`}
            ref={(el) => {
              labelRefs.current[i] = el;
            }}
            className="absolute top-0 left-1/2 -ml-[calc(var(--slot)/2)] flex w-[var(--slot)] flex-col gap-0.5 pr-2 transition-opacity duration-300 will-change-transform"
          >
            <span className="line-clamp-2 text-[11px] leading-tight font-semibold text-foreground sm:text-xs">
              {item.title}
            </span>
            <span className="truncate text-[10px] text-foreground-muted sm:text-[11px]">
              {item.category}
            </span>
            <span className="mt-1.5 block size-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-foreground-muted" />
          </div>
        ))}
      </div>

      {/* Copertine in prospettiva, sfumate ai bordi. */}
      <div
        className={`relative min-h-0 flex-1 transition-opacity duration-700 [perspective:900px] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] ${ready ? "opacity-100" : "opacity-0"}`}
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
              if (!s.current.dragging) s.current.hover = i;
            }}
            onFocus={() => onCardFocus(i)}
            onBlur={() => {
              s.current.hover = -1;
            }}
            className="absolute inset-y-0 left-1/2 -ml-[calc(var(--slot)*0.65)] block w-[calc(var(--slot)*1.3)] bg-surface outline-offset-4 will-change-transform [transform-style:preserve-3d] focus-visible:outline-2 focus-visible:outline-accent"
          >
            <Image
              src={item.cover}
              alt=""
              fill
              draggable={false}
              sizes="(min-width: 640px) 18vw, 45vw"
              loading={i < 8 ? "eager" : "lazy"}
              className="pointer-events-none object-cover"
            />
            {/* Ombra che cresce quando la copertina si mette di taglio. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-black opacity-[var(--shade,0)]"
            />
          </Link>
        ))}
      </div>

      {/* Comandi: indietro, pausa, avanti. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[60] flex justify-center sm:bottom-5">
        <div className="theme-ink pointer-events-auto flex border border-border-strong bg-background/70! backdrop-blur-md">
          <ShelfButton label="Lavori precedenti" onClick={() => step(-1)}>
            <path d="M10 3 5 8l5 5" />
          </ShelfButton>
          <ShelfButton
            label={paused ? "Riprendi lo scorrimento" : "Metti in pausa lo scorrimento"}
            onClick={() => setPaused((p) => !p)}
            className="border-x border-border-strong"
          >
            {paused ? <path d="M5 3v10l8-5z" fill="currentColor" stroke="none" /> : <path d="M6 3v10M10 3v10" />}
          </ShelfButton>
          <ShelfButton label="Lavori successivi" onClick={() => step(1)}>
            <path d="m6 3 5 5-5 5" />
          </ShelfButton>
        </div>
      </div>
    </div>
  );
}

function ShelfButton({
  label,
  onClick,
  pressed,
  className = "",
  children,
}: {
  label: string;
  onClick: () => void;
  pressed?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
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

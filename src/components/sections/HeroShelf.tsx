"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { ReelItem } from "./HeroReel";

/**
 * Slider dei lavori nell'hero, con copertine verticali 1:2 viste intere.
 *
 * - Computer e tablet ("ventaglio"): ogni copertina è un pannello con un
 *   piccolo spessore, incernierato sul bordo esterno. Ai lati è aperto e
 *   quasi piatto, verso il centro si chiude fino a mettersi di taglio; la
 *   fila scorre piano da sola. Prospettiva lunga, così i bordi restano
 *   dritti come nella fotografia di un oggetto. Al passaggio del mouse (o
 *   con Tab) la copertina si apre del tutto e le altre si abbassano.
 * - Telefono ("sfoglia"): una copertina al centro e le vicine di sbieco;
 *   si sfoglia una alla volta, avanza da sola ogni pochi secondi.
 *
 * Sempre: pausa (WCAG 2.2.2), niente movimento automatico con "riduci
 * movimento", le posizioni si scrivono direttamente sugli elementi a ogni
 * fotogramma senza ridisegnare React.
 */

const SPEED = 30; // px al secondo, scorrimento del ventaglio
const FLOW_ANGLE = 50; // gradi delle copertine vicine nello sfoglia
const FLOW_HOLD = 3.4; // secondi su ogni copertina nello sfoglia
const DRAG_THRESHOLD = 6;
const SHELF_GAP = 0.3; // spazio tra le copertine, in larghezze di copertina
const LABELS_H = 64; // riga dei titoli sopra il ventaglio
const CONTROLS_H = 72; // riga dei comandi sotto il ventaglio
const CAPTION_H = 76; // riga del nome e dei comandi sotto lo sfoglia

type Mode = "shelf" | "flow";

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}

export function HeroShelf({ items }: { items: ReelItem[] }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const [mode, setMode] = useState<Mode>("shelf");
  const [size, setSize] = useState({ w: 0, h: 0, slot: 0 });
  const [copies, setCopies] = useState(2);
  const [paused, setPaused] = useState(false);
  const [active, setActive] = useState(0);
  const ready = size.w > 0;

  const s = useRef({
    mode: "shelf" as Mode,
    pos: 0,
    vel: 0,
    target: null as number | null,
    slot: 300,
    cardW: 200,
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

  // Misure: le copertine sono sempre 1:2 e prendono l'altezza disponibile
  // (con un massimo su computer), la distanza tra una e l'altra ne deriva.
  useEffect(() => {
    const root = rootRef.current;
    const box = root?.parentElement;
    if (!root || !box) return;
    const mq = window.matchMedia("(max-width: 639px), (max-width: 1023px) and (orientation: portrait)");
    const measure = () => {
      const m: Mode = mq.matches ? "flow" : "shelf";
      const width = root.clientWidth;
      // Spazio libero nell'hero, tolti i titoli (ventaglio) o la riga del
      // nome con i comandi (sfoglia).
      const avail = box.clientHeight - (m === "flow" ? CAPTION_H : LABELS_H + CONTROLS_H);
      let h: number;
      let w: number;
      let slot: number;
      if (m === "flow") {
        w = Math.round(Math.min(avail / 2, width * 0.52));
        h = w * 2;
        slot = w;
      } else {
        // Copertine grandi quanto lo schermo permette, ma non tanto da
        // lasciarne in vista solo due: più alte sui tablet in verticale.
        const portrait = window.innerHeight > window.innerWidth;
        const ideal = portrait ? width * 0.62 : width * 0.3;
        h = Math.round(Math.min(avail, Math.max(420, Math.min(ideal, 600))));
        w = Math.round(h / 2);
        slot = Math.round(w * (1 + SHELF_GAP));
      }
      const st = s.current;
      if (st.slot && (st.mode !== m || st.slot !== slot)) {
        st.pos = Math.round(st.pos / st.slot) * slot;
        st.target = null;
      }
      st.mode = m;
      st.slot = slot;
      st.cardW = w;
      st.width = width;
      setMode(m);
      setSize((prev) => (prev.w === w && prev.h === h && prev.slot === slot ? prev : { w, h, slot }));
      setCopies(
        m === "flow"
          ? Math.max(1, Math.ceil(5 / items.length))
          : Math.max(1, Math.ceil((width + slot * 4) / (items.length * slot))),
      );
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    ro.observe(box);
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
      const { slot, width, cardW } = st;
      const loop = total * slot;
      const flow = st.mode === "flow";

      if (st.target !== null) {
        const diff = st.target - st.pos;
        st.pos += diff * Math.min(1, dt * (st.reduce ? 30 : 7));
        if (Math.abs(diff) < 0.5) {
          st.pos = st.target;
          st.target = null;
        }
      } else if (!st.dragging) {
        if (flow) {
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
        } else if (Math.abs(st.vel) > 1) {
          st.pos += st.vel * dt;
          st.vel *= Math.pow(0.04, dt);
        } else {
          st.vel = 0;
          if (!st.paused && !st.reduce && st.hover < 0) st.pos += SPEED * dt;
        }
      }

      // Il ventaglio si chiude al centro: la cerniera è sul bordo esterno
      // (sinistro a sinistra, destro a destra) e il bordo verso il centro
      // va indietro.
      const half = width / 2;
      for (let i = 0; i < total; i++) {
        const card = cardRefs.current[i];
        if (!card) continue;
        const x = mod(i * slot - st.pos + loop / 2, loop) - loop / 2;

        if (flow) {
          const n = Math.max(-1.6, Math.min(1.6, x / slot));
          const a = Math.min(1, Math.abs(n));
          card.style.transformOrigin = "50% 50%";
          // Le vicine vanno indietro in proporzione alla copertina, così
          // restano più piccole di quella al centro su ogni schermo.
          card.style.transform = `translate3d(${x * 0.8 - cardW / 2}px,0,${-a * cardW * 1.2}px) rotateY(${-Math.sign(n) * a * FLOW_ANGLE}deg)`;
          card.style.zIndex = String(100 - Math.round(Math.abs(n) * 10));
          card.style.visibility = Math.abs(n) > 1.55 ? "hidden" : "visible";
          card.style.setProperty("--shade", String(a * 0.4));
          continue;
        }

        const d = x / (half * 0.98);
        const k = Math.max(0, 1 - Math.min(1, Math.abs(d)));
        const closed = 88 * Math.pow(k, 0.85);
        const want = st.hover === i ? 1 : 0;
        st.open[i] += (want - st.open[i]) * Math.min(1, dt * (st.reduce ? 60 : 9));
        const o = st.open[i];
        const theta = closed * (1 - o);
        const left = x < 0;
        card.style.transformOrigin = left ? "0% 50%" : "100% 50%";
        card.style.transform = `translate3d(${left ? x : x - cardW}px,0,${o * 50}px) rotateY(${left ? theta : -theta}deg)`;
        card.style.zIndex = String(o > 0.05 ? 50 : 10);
        card.style.visibility = Math.abs(d) > 1.25 ? "hidden" : "visible";
        const dim = st.hover >= 0 && st.hover !== i ? 0.55 : 0;
        card.style.setProperty("--shade", String(Math.max(Math.sin((theta * Math.PI) / 180) * 0.3, dim) * (1 - o)));
        const label = labelRefs.current[i];
        if (label) {
          // Il titolo sta sopra il bordo sinistro visibile della copertina:
          // a sinistra è la cerniera, a destra il bordo che si chiude.
          const lx = left ? x : x - cardW * Math.cos((theta * Math.PI) / 180);
          label.style.transform = `translate3d(${lx}px,0,0)`;
          // Con una copertina aperta resta solo il suo titolo: gli altri
          // finirebbero sotto, sovrapposti.
          label.style.opacity = String(Math.abs(d) > 1.02 ? 0 : st.hover >= 0 && st.hover !== i ? 0 : 1);
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
    if (!st.dragging && Math.abs(e.clientX - st.startX) > DRAG_THRESHOLD) {
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
    st.pos = st.startPos - (e.clientX - st.startX) * (st.mode === "flow" ? 1.15 : 1);
  }

  function onPointerUp(e: React.PointerEvent) {
    const st = s.current;
    if (st.pointerId !== e.pointerId) return;
    st.pointerId = -1;
    if (!st.dragging) return;
    st.dragging = false;
    if (performance.now() - st.lastT > 80) st.vel = 0;
    if (st.mode === "flow") {
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

  // Con Tab la copertina si apre e, se è vicina al bordo, entra nello schermo.
  function onCardFocus(i: number) {
    const st = s.current;
    const x = xOf(i);
    st.hold = 0;
    if (st.mode === "flow") {
      st.target = st.pos + x;
      return;
    }
    st.hover = i;
    const limit = st.width / 2 - st.slot * 1.2;
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
      style={
        {
          "--cw": `${size.w}px`,
          "--ch": `${size.h}px`,
          "--lw": `${Math.max(0, size.slot - 16)}px`,
          "--depth": flow ? "6px" : "10px",
          height: ready ? size.h + (flow ? CAPTION_H : LABELS_H + CONTROLS_H) : "100%",
        } as React.CSSProperties
      }
      className="hero-shelf relative flex min-h-0 w-full touch-pan-y flex-col select-none"
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
      {/* Ventaglio: titoli dritti sopra le cerniere, seguono lo scorrimento. */}
      {!flow ? (
        <div
          aria-hidden="true"
          className={`relative h-[64px] shrink-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}
        >
          {cards.map(({ item, i }) => (
            <div
              key={`l${i}`}
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
              className="absolute top-0 left-1/2 flex w-[var(--lw)] flex-col gap-0.5 transition-opacity duration-300 will-change-transform"
            >
              <span className="truncate text-xs leading-tight font-semibold text-foreground">{item.title}</span>
              <span className="truncate text-[11px] text-foreground-muted">{item.category}</span>
              <span className="mt-1.5 block size-0 border-y-[3px] border-l-[5px] border-y-transparent border-l-foreground-muted" />
            </div>
          ))}
        </div>
      ) : null}

      {/* Palco delle copertine. */}
      <div
        style={flow ? { perspective: `${Math.round(size.w * 3.4)}px` } : undefined}
        className={`relative min-h-0 flex-1 transition-opacity duration-700 ${flow ? "" : "[perspective:2400px] [mask-image:linear-gradient(90deg,transparent,#000_5%,#000_95%,transparent)]"} ${ready ? "opacity-100" : "opacity-0"}`}
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
            className="group absolute top-1/2 left-1/2 -mt-[calc(var(--ch)/2)] block h-[var(--ch)] w-[var(--cw)] outline-none will-change-transform [transform-style:preserve-3d]"
          >
            {/* Fronte: la copertina intera. */}
            <span className="absolute inset-0 overflow-hidden bg-surface [backface-visibility:hidden]">
              <Image
                src={item.cover}
                alt=""
                fill
                draggable={false}
                sizes="(min-width: 640px) 240px, 55vw"
                loading={i < 8 ? "eager" : "lazy"}
                className="pointer-events-none object-cover object-top"
              />
              <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(90deg,rgb(255_255_255/0.1),transparent_6%,transparent_94%,rgb(0_0_0/0.18))]" />
              <span aria-hidden="true" className="absolute inset-0 bg-black opacity-[var(--shade,0)]" />
            </span>
            {/* Fuoco da tastiera: cornice lavanda (il contorno classico non
                si disegna bene sugli elementi in 3D). */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 border-4 border-accent shadow-[inset_0_0_0_2px_rgb(0_0_0/0.85)] opacity-0 [transform:translateZ(1px)] group-focus-visible:opacity-100"
            />
            {/* Spessore sui due lati: si vede quello verso chi guarda. */}
            {(["left", "right"] as const).map((side) => (
              <span
                key={side}
                aria-hidden="true"
                className={`absolute inset-y-0 w-[var(--depth)] overflow-hidden bg-surface [backface-visibility:hidden] ${
                  side === "left"
                    ? "right-full origin-right [transform:rotateY(-90deg)]"
                    : "left-full origin-left [transform:rotateY(90deg)]"
                }`}
              >
                <Image
                  src={item.cover}
                  alt=""
                  fill
                  draggable={false}
                  sizes="(min-width: 640px) 240px, 55vw"
                  loading={i < 8 ? "eager" : "lazy"}
                  className={`pointer-events-none object-cover ${side === "left" ? "object-left" : "object-right"}`}
                />
                <span className="absolute inset-0 bg-black/45" />
              </span>
            ))}
          </Link>
        ))}

      </div>

      {/* Ventaglio: comandi sotto le copertine, al centro. */}
      {!flow ? (
        <div className="flex h-[72px] shrink-0 items-end justify-center">{controls}</div>
      ) : null}

      {/* Sfoglia: nome del lavoro in primo piano e comandi sotto. */}
      {flow ? (
        <div className="container-px flex h-[76px] shrink-0 items-end justify-between gap-4">
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

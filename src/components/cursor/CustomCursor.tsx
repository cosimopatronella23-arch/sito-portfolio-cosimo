"use client";

import { useEffect, useRef } from "react";
import { isSafari } from "@/lib/isSafari";

/**
 * Cursore custom con leggero ritardo (lerp) calcolato a ogni fotogramma,
 * senza librerie: il ciclo gira solo mentre il cursore si sta muovendo.
 * Disattivato su touch/mobile e quando l'utente preferisce ridurre le animazioni.
 * Si ingrandisce e mostra un'etichetta sugli elementi con data-cursor="link"
 * (opzionalmente data-cursor-text="Testo personalizzato").
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const supportsFinePointer = window.matchMedia(
      "(hover: hover) and (pointer: fine)",
    ).matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // Anche da fermo (senza l'inversione di colore, già tolta) il cursore
    // custom restava percepibilmente a scatti su Safari/Mac: il problema
    // non era solo il mix-blend-mode ma il ricalcolo continuo ad ogni
    // movimento del mouse. Su Safari si rinuncia del tutto e si torna
    // al puntatore di sistema — la regola CSS accanto nasconde comunque il
    // pallino, questo evita pure di far girare il loop JS inutilmente.
    if (!supportsFinePointer || prefersReducedMotion || isSafari()) {
      return;
    }

    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    document.documentElement.classList.add("cursor-active-custom");

    // Ritardo breve solo per addolcire il movimento (effetto "morbido"),
    // non abbastanza da percepirsi come lento o poco reattivo: a ogni
    // fotogramma il pallino percorre una parte della distanza che manca,
    // in proporzione al tempo trascorso (uguale a 60 e a 120 Hz).
    let x = 0;
    let y = 0;
    let targetX = 0;
    let targetY = 0;
    let scale = 1;
    let frame = 0;
    let last = 0;
    let started = false;

    function render() {
      dot!.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    function tick(now: number) {
      const dt = last ? Math.min(now - last, 64) : 16.7;
      last = now;
      const k = 1 - Math.pow(1 - 0.35, dt / 16.7);
      x += (targetX - x) * k;
      y += (targetY - y) * k;
      if (Math.abs(targetX - x) < 0.1 && Math.abs(targetY - y) < 0.1) {
        x = targetX;
        y = targetY;
        render();
        frame = 0;
        last = 0;
        return;
      }
      render();
      frame = requestAnimationFrame(tick);
    }

    function handleMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!started) {
        // Primo movimento: il pallino compare già sotto il mouse.
        started = true;
        x = targetX;
        y = targetY;
        render();
        return;
      }
      if (!frame) frame = requestAnimationFrame(tick);
    }

    function setScale(value: number) {
      scale = value;
      render();
    }

    function handleEnter(e: Event) {
      const target = e.currentTarget as HTMLElement;
      const text = target.dataset.cursorText ?? "";
      label!.textContent = text;
      dot!.dataset.expanded = text ? "text" : "dot";
      setScale(text ? 1 : 1.8);
    }

    function handleLeave() {
      label!.textContent = "";
      dot!.dataset.expanded = "";
      setScale(1);
    }

    window.addEventListener("mousemove", handleMove);

    const targets = Array.from(
      document.querySelectorAll<HTMLElement>('[data-cursor="link"]'),
    );
    targets.forEach((el) => {
      el.addEventListener("mouseenter", handleEnter);
      el.addEventListener("mouseleave", handleLeave);
    });

    const observer = new MutationObserver(() => {
      const nextTargets = Array.from(
        document.querySelectorAll<HTMLElement>('[data-cursor="link"]'),
      );
      nextTargets.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
        el.addEventListener("mouseenter", handleEnter);
        el.addEventListener("mouseleave", handleLeave);
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.documentElement.classList.remove("cursor-active-custom");
      window.removeEventListener("mousemove", handleMove);
      cancelAnimationFrame(frame);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", handleEnter);
        el.removeEventListener("mouseleave", handleLeave);
      });
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={dotRef}
      className="custom-cursor-dot pointer-events-none fixed top-0 left-0 z-[9999] hidden h-3.5 w-3.5 rotate-45 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-white text-background mix-blend-difference transition-[width,height,padding,transform] duration-300 ease-out [&[data-expanded='text']]:h-auto [&[data-expanded='text']]:w-auto [&[data-expanded='text']]:rotate-0 [&[data-expanded='text']]:px-4 [&[data-expanded='text']]:py-2 [@media(hover:hover)_and_(pointer:fine)]:flex"
      aria-hidden="true"
    >
      <span
        ref={labelRef}
        className="w-max text-center text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase"
      />
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Cursore custom con leggero delay (lerp) via GSAP quickTo.
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

    if (!supportsFinePointer || prefersReducedMotion) {
      return;
    }

    const dot = dotRef.current;
    const label = labelRef.current;
    if (!dot || !label) return;

    document.documentElement.classList.add("cursor-active-custom");

    // Ritardo breve solo per addolcire il movimento (effetto "morbido"),
    // non abbastanza da percepirsi come lento o poco reattivo.
    const xTo = gsap.quickTo(dot, "x", { duration: 0.15, ease: "power3" });
    const yTo = gsap.quickTo(dot, "y", { duration: 0.15, ease: "power3" });

    function handleMove(e: MouseEvent) {
      xTo(e.clientX);
      yTo(e.clientY);
    }

    function handleEnter(e: Event) {
      const target = e.currentTarget as HTMLElement;
      const text = target.dataset.cursorText ?? "";
      label!.textContent = text;
      dot!.dataset.expanded = text ? "text" : "dot";
      gsap.to(dot!, {
        scale: text ? 1 : 1.8,
        duration: 0.3,
        ease: "power2.out",
      });
    }

    function handleLeave() {
      label!.textContent = "";
      dot!.dataset.expanded = "";
      gsap.to(dot!, { scale: 1, duration: 0.3, ease: "power2.out" });
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
      className="pointer-events-none fixed top-0 left-0 z-[9999] hidden h-3.5 w-3.5 rotate-45 -translate-x-1/2 -translate-y-1/2 items-center justify-center bg-accent text-background transition-[width,height,padding,transform] duration-300 ease-out [&[data-expanded='text']]:h-auto [&[data-expanded='text']]:w-auto [&[data-expanded='text']]:rotate-0 [&[data-expanded='text']]:px-4 [&[data-expanded='text']]:py-2 [@media(hover:hover)_and_(pointer:fine)]:flex"
      aria-hidden="true"
    >
      <span
        ref={labelRef}
        className="w-max text-center text-[11px] font-semibold tracking-wide whitespace-nowrap uppercase"
      />
    </div>
  );
}

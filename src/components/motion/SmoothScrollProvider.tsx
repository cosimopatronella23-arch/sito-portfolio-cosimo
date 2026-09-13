"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";

/**
 * Smooth scroll cinematografico via Lenis. Non renderizza nulla: si limita a
 * intercettare lo scroll nativo. Disattivato automaticamente se l'utente
 * preferisce ridurre le animazioni (prefers-reduced-motion).
 */
export function SmoothScrollProvider() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Lenis tiene una propria posizione di scroll indipendente da
  // window.scrollTo: cambiando pagina (Next.js non la rimonta, essendo nel
  // layout condiviso) restava fermo al punto in cui ci si trovava sulla
  // pagina precedente, invece di tornare in cima. "immediate" evita che il
  // reset stesso venga visto come uno scroll animato.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return null;
}

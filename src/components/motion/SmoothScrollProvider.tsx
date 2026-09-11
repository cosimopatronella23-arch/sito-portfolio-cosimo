"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scroll cinematografico via Lenis. Non renderizza nulla: si limita a
 * intercettare lo scroll nativo. Disattivato automaticamente se l'utente
 * preferisce ridurre le animazioni (prefers-reduced-motion).
 */
export function SmoothScrollProvider() {
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

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return null;
}

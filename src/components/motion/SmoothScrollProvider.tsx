"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { isSafari } from "@/lib/isSafari";

/**
 * Smooth scroll cinematografico via Lenis. Non renderizza nulla: si limita a
 * intercettare lo scroll nativo. Disattivato automaticamente se l'utente
 * preferisce ridurre le animazioni (prefers-reduced-motion) — e su Safari,
 * dove uno scroll "virtuale" guidato da JS combinato con blur/mix-blend-mode
 * animati altrove nel sito produceva scatti visibili che Chrome non ha:
 * lì si torna allo scroll nativo del sistema, già fluido di suo.
 */
export function SmoothScrollProvider() {
  const lenisRef = useRef<Lenis | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReducedMotion || isSafari()) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      // Calcola il fondo pagina in tempo reale. Di default Lenis lo misura
      // osservando <html>, che qui è alto quanto la finestra (h-full): il
      // valore restava quello della prima pagina aperta e, cambiando pagina
      // o caricando immagini, lo scroll si bloccava a metà fino al reload.
      naiveDimensions: true,
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
  // reset stesso venga visto come uno scroll animato. Quando Lenis non è
  // attivo (Safari, o prefers-reduced-motion) si usa lo scroll nativo.
  //
  // Se l'indirizzo ha un'ancora (es. "Contatti" → /#contatti da un'altra
  // pagina) si va alla sezione invece che in cima. La sezione compare solo
  // dopo la transizione tra pagine, quindi la si attende per qualche istante.
  useEffect(() => {
    const scrollTo = (target: number | HTMLElement) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { immediate: true });
      } else if (typeof target === "number") {
        window.scrollTo(0, target);
      } else {
        target.scrollIntoView();
      }
    };

    scrollTo(0);

    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;

    let attempts = 0;
    const timer = window.setInterval(() => {
      const section = document.getElementById(id);
      if (section || ++attempts > 20) window.clearInterval(timer);
      if (section) scrollTo(section);
    }, 100);
    return () => window.clearInterval(timer);
  }, [pathname]);

  return null;
}

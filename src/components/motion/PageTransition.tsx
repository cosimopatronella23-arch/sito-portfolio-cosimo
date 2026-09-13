"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

/**
 * Transizione tra pagine in due parti:
 * 1) il contenuto nuovo entra con un piccolo fade+risalita (come prima).
 * 2) un pannello pieno ("sipario") copre lo schermo e si ritrae verso
 *    l'alto, rivelando la pagina già montata sotto — l'effetto "reveal" da
 *    studio di design, invece del solito taglio secco tra una pagina e
 *    l'altra. Non parte al primo caricamento (sarebbe solo un ritardo
 *    percepito, non un miglioramento) e si disattiva con
 *    prefers-reduced-motion, perché un pannello a schermo intero che si
 *    muove ad ogni click è il tipo di movimento più fastidioso per chi ha
 *    disturbi vestibolari.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const firstPathname = useRef(pathname);
  const [showCurtain, setShowCurtain] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (pathname !== firstPathname.current) {
      setShowCurtain(true);
    }
  }, [pathname]);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>

      {showCurtain && !shouldReduceMotion ? (
        <motion.div
          key={`curtain-${pathname}`}
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          style={{ originY: 0 }}
          className="pointer-events-none fixed inset-0 z-[999] bg-background"
          aria-hidden="true"
        />
      ) : null}
    </>
  );
}

"use client";

import { motion } from "framer-motion";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Testo che entra parola per parola, ognuna "scoperta" da una maschera che
 * scorre verso l'alto — l'animazione da studio di design che si vede su
 * siti come Studio Dumbar, invece del solito fade su tutto il blocco in una
 * volta.
 *
 * I titoli che la usano hanno un line-height molto stretto (es.
 * leading-[0.92], per la resa "poster"), che si eredita nel contenitore
 * overflow-hidden di ogni parola e TAGLIA le lettere con la coda (g, p, y —
 * successo davvero con la "g" di "design" nell'Hero). Fix standard
 * "leading-trim": padding-bottom per dare spazio reale, margin-bottom
 * negativo della stessa misura per non allargare lo spazio tra le righe.
 */
export function AnimatedText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span
          key={i}
          className="-mb-[0.3em] inline-block overflow-hidden pb-[0.3em]"
        >
          <motion.span
            className="inline-block"
            initial={{ y: "100%" }}
            whileInView={{ y: "0%" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              duration: 0.7,
              delay: delay + i * 0.05,
              ease: EASE_OUT,
            }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

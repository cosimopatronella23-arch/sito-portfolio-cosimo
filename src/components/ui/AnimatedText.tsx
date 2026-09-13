"use client";

import { motion } from "framer-motion";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Testo che entra parola per parola, ognuna "scoperta" da una maschera che
 * scorre verso l'alto — l'animazione da studio di design che si vede su
 * siti come Studio Dumbar, invece del solito fade su tutto il blocco in una
 * volta. Ogni parola sta in un contenitore overflow-hidden della sua stessa
 * altezza, così la maschera non taglia mai discendenti di lettere come "g"
 * o "p".
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
        <span key={i} className="inline-block overflow-hidden">
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

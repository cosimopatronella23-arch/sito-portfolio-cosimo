"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import type { HomeContent, SectionTheme } from "@/lib/types";
import type { ReactNode } from "react";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.2 + i * 0.08, ease: EASE_OUT },
  }),
};

/**
 * Apertura della homepage, sistema grafico "Dumbar": titolo gigante sulla
 * un montaggio a schermo intero dei lavori dietro (tagli a ritmo, parallasse
 * col mouse) e un pulsante. Le linee della griglia si disegnano all'ingresso.
 */
export function Hero({
  content,
  eyebrow,
  theme,
  stage,
}: {
  content: HomeContent;
  eyebrow: string;
  theme: SectionTheme;
  /** Montaggio dei lavori a schermo intero dietro il titolo (ReelStage). */
  stage?: ReactNode;
}) {
  const reduce = useReducedMotion();
  // Un "a capo" nel titolo in /admin manda a capo anche qui; le righe vuote
  // (es. un a capo finale) si ignorano.
  const titleLines = content.hero_title_main
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const [first, ...others] = titleLines;

  return (
    <section
      data-hero
      className={`theme-${theme} relative isolate h-svh min-h-[34rem] overflow-hidden`}
    >
      {stage}

      {/* Ruolo, città e sottotitolo non si vedono (l'apertura è fatta di
          titolo e lavori) ma restano per Google e per gli screen reader:
          sono il punto che dice cosa fai e dove. */}
      <p className="sr-only">
        {eyebrow}. {content.hero_subtitle}
      </p>

      <div className="container-px pointer-events-none relative z-10 flex h-full flex-col justify-end gap-6 pb-8 sm:pb-12 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <h1 className="hero-title font-display text-[clamp(3.25rem,min(11vw,15vh),11rem)] leading-[0.9] font-bold tracking-[-0.045em] lg:min-w-0 lg:flex-1">
          <span className="block">
            <AnimatedText text={first ?? ""} />
          </span>
          {/* Gli spazi tra le righe non si vedono (sono blocchi) ma servono
              a chi legge il testo: senza, Google e gli screen reader
              leggerebbero "Grafica eweb design.Senza fronzoli." */}
          {others.map((line, i) => (
            <Fragment key={i}>
              {" "}
              <span className="block sm:pl-[16.66%]">
                <AnimatedText text={line} delay={(i + 1) * 0.12} />
              </span>
            </Fragment>
          ))}{" "}
          <span className="block text-accent">
            <AnimatedText
              text={content.hero_title_accent}
              delay={titleLines.length * 0.12}
            />
          </span>
        </h1>
        <motion.div
          variants={fadeUp}
          initial={reduce ? false : "hidden"}
          animate="visible"
          custom={2}
          className="pointer-events-auto lg:w-72 lg:shrink-0"
        >
          <Button href="/#contatti" size="lg" arrow className="w-full justify-between">
            {content.cta_primary}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

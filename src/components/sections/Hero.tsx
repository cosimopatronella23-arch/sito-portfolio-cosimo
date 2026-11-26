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
 * Apertura della homepage: in alto lo scaffale dei lavori in prospettiva
 * (HeroShelf), in basso il titolo a sinistra e il pulsante a destra.
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
  /** Scaffale dei lavori sopra il titolo (HeroShelf). */
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
      className={`theme-${theme} relative isolate flex h-svh min-h-[40rem] flex-col overflow-hidden pt-[104px] sm:pt-[120px]`}
    >
      {/* Ruolo, città e sottotitolo non si vedono (l'apertura è fatta di
          titolo e lavori) ma restano per Google e per gli screen reader:
          sono il punto che dice cosa fai e dove. */}
      <p className="sr-only">
        {eyebrow}. {content.hero_subtitle}
      </p>

      {/* Scaffale dei lavori: occupa lo spazio tra la barra e il titolo. */}
      {stage ? <div className="relative flex min-h-0 flex-1 items-center">{stage}</div> : <div className="flex-1" />}

      <div className="container-px relative z-10 flex shrink-0 flex-col gap-5 pt-6 pb-6 sm:pt-8 sm:pb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <h1 className="hero-title font-display text-[clamp(2.25rem,min(5vw,7.5vh),5.5rem)] leading-[0.92] font-bold tracking-[-0.045em] lg:min-w-0 lg:flex-1">
          <span className="block">
            <AnimatedText text={first ?? ""} />
          </span>
          {/* Gli spazi tra le righe non si vedono (sono blocchi) ma servono
              a chi legge il testo: senza, Google e gli screen reader
              leggerebbero "Grafica eweb design.Senza fronzoli." */}
          {others.map((line, i) => (
            <Fragment key={i}>
              {" "}
              <span className="block">
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
          className="lg:w-72 lg:shrink-0"
        >
          <Button href="/#contatti" size="lg" arrow className="w-full justify-between">
            {content.cta_primary}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

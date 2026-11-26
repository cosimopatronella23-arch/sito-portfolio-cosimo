"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
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
 * Apertura della homepage, "piano inclinato": il muro dei lavori in
 * prospettiva sullo sfondo (HeroWall), in basso a sinistra riga di ruolo,
 * titolo, pulsante e link ai progetti.
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
  /** Muro dei lavori sullo sfondo (HeroWall). */
  stage?: ReactNode;
}) {
  const reduce = useReducedMotion();
  // Un "a capo" nel titolo in /admin manda a capo anche qui; le righe vuote
  // (es. un a capo finale) si ignorano.
  const titleLines = content.hero_title_main
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  return (
    <section
      data-hero
      className={`theme-${theme} relative isolate h-svh min-h-[40rem] overflow-hidden`}
    >
      {/* Muro dei lavori sullo sfondo (HeroWall). */}
      {stage}

      {/* Il sottotitolo non si vede ma resta per Google e per gli screen
          reader: dice cosa fai e dove. */}
      <p className="sr-only">{content.hero_subtitle}</p>

      <div className="container-px pointer-events-none relative z-10 flex h-full flex-col justify-end pb-7 sm:pb-12">
        <motion.p
          variants={fadeUp}
          initial={reduce ? false : "hidden"}
          animate="visible"
          custom={0}
          className="mb-5 text-[10px] font-medium tracking-[0.1em] text-foreground-muted uppercase sm:mb-7 sm:text-xs sm:tracking-[0.14em]"
        >
          {eyebrow}
        </motion.p>
        {/* Due righe su telefono ("...web design." / "Senza fronzoli."),
            tre su computer come nella composizione scelta. Gli "a capo"
            scritti in /admin qui diventano spazi. */}
        <h1 className="font-display max-w-[44rem] text-[min(7.6vw,3.25rem)] leading-[0.95] font-bold tracking-[-0.045em] sm:text-[clamp(3.25rem,6vw,5.75rem)]">
          {titleLines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 ? " " : null}
              <AnimatedText text={line} delay={0.15 + i * 0.12} />
            </Fragment>
          ))}{" "}
          <span className="hero-accent text-accent">
            <AnimatedText text={content.hero_title_accent} delay={0.15 + titleLines.length * 0.12} />
          </span>
        </h1>
        <motion.div
          variants={fadeUp}
          initial={reduce ? false : "hidden"}
          animate="visible"
          custom={4}
          className="pointer-events-auto mt-7 flex flex-col gap-4 sm:mt-10 sm:flex-row sm:items-center sm:gap-8"
        >
          <Button href="/#contatti" size="lg" arrow className="w-full justify-between sm:w-72">
            {content.cta_primary}
          </Button>
          <Link
            href="/progetti"
            data-cursor="link"
            className="-my-3 hidden w-max py-3 text-sm text-foreground-muted transition-colors hover:text-foreground sm:block"
          >
            <span className="link-draw">Guarda i progetti</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

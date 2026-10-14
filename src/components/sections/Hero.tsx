"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { Shape } from "@/components/dumbar/Shapes";
import type { HomeContent, SectionTheme } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.35 + i * 0.1, ease: EASE_OUT },
  }),
};

/**
 * Apertura della homepage, sistema grafico "Dumbar": titolo gigante sulla
 * griglia a 12 colonne, una fila di forme geometriche (cerchio, quadrato,
 * anello, quarto di cerchio) accanto alla prima riga, sottotitolo,
 * citazione e pulsanti. Le linee della griglia si disegnano all'ingresso.
 */
export function Hero({
  content,
  eyebrow,
  theme,
}: {
  content: HomeContent;
  eyebrow: string;
  theme: SectionTheme;
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
      className={`theme-${theme} relative overflow-hidden container-px pt-10 pb-16 sm:pt-14 sm:pb-20`}
    >
      {/* Griglia a 12 colonne sullo sfondo, disegnata dall'alto. */}
      <div
        aria-hidden="true"
        className="container-px pointer-events-none absolute inset-0 hidden sm:block"
      >
        <div className="grid h-full grid-cols-12 border-r border-border">
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="h-full origin-top border-l border-border"
              initial={reduce ? false : { scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 1.1, delay: i * 0.04, ease: EASE_OUT }}
            />
          ))}
        </div>
      </div>

      <div className="relative">
        <motion.div
          variants={fadeUp}
          initial={reduce ? false : "hidden"}
          animate="visible"
          className="flex items-center justify-between gap-6 text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase"
        >
          <span>{eyebrow}</span>
          <span className="hidden sm:inline">Portfolio {new Date().getFullYear()}</span>
        </motion.div>

        <h1 className="font-display mt-8 text-[clamp(3.25rem,min(9.6vw,14vh),9rem)] leading-[0.9] font-bold tracking-[-0.045em] sm:mt-9">
          <span className="flex flex-col-reverse gap-6 sm:flex-row sm:items-center sm:justify-between">
            <span>
              <AnimatedText text={first ?? ""} />
            </span>
            <span className="flex items-end gap-2.5 sm:gap-4" aria-hidden="true">
              <Shape kind="circle" color="bg-accent" float="fast" className="size-14 hover:scale-110 sm:size-[clamp(4rem,min(8vw,12vh),7.5rem)]" />
              <Shape kind="square" color="bg-paper" className="size-14 hover:rotate-45 sm:size-[clamp(4rem,min(8vw,12vh),7.5rem)]" />
              <Shape kind="ring" color="border-foreground" float="slow" className="size-14 hover:scale-90 sm:size-[clamp(4rem,min(8vw,12vh),7.5rem)]" />
              <Shape kind="quarter" color="bg-accent" className="size-14 hover:-rotate-90 sm:size-[clamp(4rem,min(8vw,12vh),7.5rem)]" />
            </span>
          </span>
          {others.map((line, i) => (
            <Fragment key={i}>
              <span className="block sm:pl-[16.66%]">
                <AnimatedText text={line} delay={(i + 1) * 0.12} />
              </span>
            </Fragment>
          ))}
          <span className="block text-accent">
            <AnimatedText
              text={content.hero_title_accent}
              delay={titleLines.length * 0.12}
            />
          </span>
        </h1>

        <div className="mt-12 grid grid-cols-1 items-end gap-8 sm:mt-14 lg:grid-cols-12 lg:gap-6">
          <motion.p
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="visible"
            custom={1}
            className="max-w-xl text-lg leading-relaxed whitespace-pre-line text-foreground/85 lg:col-span-5 sm:text-xl"
          >
            {content.hero_subtitle}
          </motion.p>
          {content.hero_quote ? (
            <motion.p
              variants={fadeUp}
              initial={reduce ? false : "hidden"}
              animate="visible"
              custom={2}
              className="font-display max-w-sm border-l-2 border-accent pl-4 text-sm leading-relaxed text-foreground-muted lg:col-span-3 lg:col-start-7"
            >
              {content.hero_quote}
            </motion.p>
          ) : null}
          <motion.div
            variants={fadeUp}
            initial={reduce ? false : "hidden"}
            animate="visible"
            custom={3}
            className="flex flex-col gap-3 sm:flex-row lg:col-span-3 lg:col-start-10 lg:flex-col lg:items-stretch"
          >
            <Button href="/#contatti" size="lg" arrow className="justify-between">
              {content.cta_primary}
            </Button>
            <Button href="/#progetti" variant="secondary" size="lg" className="justify-between">
              {content.cta_secondary}
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

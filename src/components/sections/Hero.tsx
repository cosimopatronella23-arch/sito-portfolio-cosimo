"use client";

import { Fragment } from "react";
import { motion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { AnimatedBlob } from "@/components/ui/AnimatedBlob";
import { Marquee } from "@/components/ui/Marquee";
import { sectionStyle } from "@/lib/contrast";
import type { HomeContent } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: EASE_OUT },
  }),
};

export function Hero({ content }: { content: HomeContent }) {
  // Toglie solo spazi/tab finali (mai affidabili da un editor/trim), ma
  // preserva un "a capo" finale intenzionale: serve a spingere il titolo
  // accentato sulla riga successiva invece che in coda all'ultima riga.
  const titleLines = content.hero_title_main.replace(/[ \t]+$/, "").split("\n");
  const style = sectionStyle(content.section_colors?.hero);

  return (
    <section
      style={style}
      className="relative overflow-hidden container-px pt-20 pb-0 sm:pt-28"
    >
      <AnimatedBlob className="-top-32 -right-24 -z-10 h-[26rem] w-[26rem] sm:h-[34rem] sm:w-[34rem]" />
      <AnimatedBlob
        variant="warm"
        opacity={0.3}
        className="-bottom-40 left-[-10rem] -z-10 hidden h-[22rem] w-[22rem] sm:block"
      />

      <span
        className="font-display pointer-events-none absolute right-[-0.04em] bottom-[-0.12em] -z-10 text-[40vw] leading-none font-bold text-foreground/[0.12] select-none sm:text-[26vw]"
        aria-hidden="true"
      >
        00
      </span>

      <div className="relative flex flex-col gap-8 pb-24 sm:pb-32">
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
          className="font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl md:text-7xl"
        >
          {titleLines.map((line, i) => (
            <Fragment key={i}>
              {i > 0 ? <br /> : null}
              {line}
            </Fragment>
          ))}
          <span className="text-accent"> {content.hero_title_accent}</span>
        </motion.h1>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={1}
          className="max-w-xl text-lg text-foreground-muted"
        >
          {content.hero_subtitle}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={2}
          className="flex flex-wrap items-center gap-5"
        >
          <Button href="/#contatti" size="lg">
            {content.cta_primary}
          </Button>
          <Button href="/#progetti" variant="secondary" size="lg">
            {content.cta_secondary}
          </Button>
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={3}
          className="font-display max-w-[16rem] -rotate-2 text-base text-foreground-muted italic"
        >
          {content.hero_quote}
        </motion.p>
      </div>

      <div className="relative mx-[calc(50%-50vw)] w-screen">
        <Marquee items={["Web Design", "UI/UX", "SEO", "Frontend"]} />
      </div>
    </section>
  );
}

"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { HeroAltBlockData } from "@/lib/types";

/**
 * Blocco "Hero alternativo": variante più minimale e centrata dell'Hero
 * principale, pensata per introdurre un secondo momento forte più in basso
 * nella pagina. Fa parte della Fase A del sistema di blocchi.
 */
export function HeroAlt({ data }: { data: HeroAltBlockData }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="container-px border-t border-border py-24 sm:py-32"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center">
        {data.title ? (
          <h2 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {data.title}
          </h2>
        ) : null}
        {data.subtitle ? (
          <p className="max-w-xl text-lg text-foreground-muted">
            {data.subtitle}
          </p>
        ) : null}
        {data.ctaLabel && data.ctaHref ? (
          <Button href={data.ctaHref} size="lg">
            {data.ctaLabel}
          </Button>
        ) : null}
      </div>
    </motion.section>
  );
}

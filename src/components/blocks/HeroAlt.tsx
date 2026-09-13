"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { pickTextColors } from "@/lib/contrast";
import type { HeroAltBlockData } from "@/lib/types";

/**
 * Blocco "Hero alternativo": variante più minimale dell'Hero principale,
 * pensata per introdurre un secondo momento forte più in basso nella
 * pagina. Fa parte della Fase A del sistema di blocchi.
 */
export function HeroAlt({ data }: { data: HeroAltBlockData }) {
  const centered = data.align === "center";
  const colors = pickTextColors(data.backgroundColor);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={data.backgroundColor ? { backgroundColor: data.backgroundColor } : undefined}
      className="container-px py-24 sm:py-32"
    >
      <div
        className={clsx(
          "flex max-w-3xl flex-col gap-6",
          centered ? "mx-auto items-center text-center" : "items-start text-left",
        )}
      >
        {data.title ? (
          <h2
            style={colors ? { color: colors.text } : undefined}
            className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl"
          >
            {data.title}
          </h2>
        ) : null}
        {data.subtitle ? (
          <p
            style={colors ? { color: colors.muted } : undefined}
            className="max-w-xl text-lg text-foreground-muted"
          >
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

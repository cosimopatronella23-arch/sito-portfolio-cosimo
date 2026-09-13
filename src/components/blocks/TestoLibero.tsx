"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import { pickTextColors } from "@/lib/contrast";
import type { TestoLiberoBlockData } from "@/lib/types";

/**
 * Blocco "Testo libero": titolo + testo formattato (Tiptap) + CTA opzionale.
 * Fa parte della Fase A del sistema di blocchi — vedi HomeContent.blocks.
 */
export function TestoLibero({ data }: { data: TestoLiberoBlockData }) {
  const centered = data.align === "center";
  const colors = pickTextColors(data.backgroundColor);

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={data.backgroundColor ? { backgroundColor: data.backgroundColor } : undefined}
      className="container-px py-20 sm:py-28"
    >
      <div
        className={clsx(
          "flex max-w-2xl flex-col gap-6",
          centered ? "mx-auto text-center" : "text-left",
        )}
      >
        {data.title ? (
          <h2
            style={colors ? { color: colors.text } : undefined}
            className="font-display text-3xl font-semibold tracking-tight sm:text-4xl"
          >
            {data.title}
          </h2>
        ) : null}
        {data.body ? (
          <div
            style={colors ? { color: colors.muted } : undefined}
            className="prose-editor text-foreground-muted"
            dangerouslySetInnerHTML={{ __html: data.body }}
          />
        ) : null}
        {data.ctaLabel && data.ctaHref ? (
          <div
            className={clsx("mt-2 flex", centered ? "justify-center" : "justify-start")}
          >
            <Button href={data.ctaHref}>{data.ctaLabel}</Button>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

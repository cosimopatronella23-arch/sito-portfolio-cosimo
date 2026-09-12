"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import type { TestoLiberoBlockData } from "@/lib/types";

/**
 * Blocco "Testo libero": titolo + testo formattato (Tiptap) + CTA opzionale.
 * Fa parte della Fase A del sistema di blocchi — vedi HomeContent.blocks.
 */
export function TestoLibero({ data }: { data: TestoLiberoBlockData }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="container-px py-20 sm:py-28"
    >
      <div className="mx-auto flex max-w-2xl flex-col gap-6 text-center">
        {data.title ? (
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            {data.title}
          </h2>
        ) : null}
        {data.body ? (
          <div
            className="prose-editor text-foreground-muted"
            dangerouslySetInnerHTML={{ __html: data.body }}
          />
        ) : null}
        {data.ctaLabel && data.ctaHref ? (
          <div className="mt-2 flex justify-center">
            <Button href={data.ctaHref}>{data.ctaLabel}</Button>
          </div>
        ) : null}
      </div>
    </motion.section>
  );
}

"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { Button } from "@/components/ui/Button";
import type { CtaBannerBlockData } from "@/lib/types";

/**
 * Blocco "CTA banner": riquadro in evidenza con titolo/sottotitolo e un
 * bottone, pensato per un invito all'azione a metà pagina. Fase B del
 * sistema di blocchi — vedi HomeContent.blocks.
 */
export function CtaBanner({ data }: { data: CtaBannerBlockData }) {
  const centered = data.align === "center";

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="container-px py-16 sm:py-20"
    >
      <div
        className={clsx(
          "flex flex-col gap-6 border border-border-strong bg-surface p-10 sm:p-14",
          centered
            ? "items-center text-center"
            : "items-start text-left sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className={clsx("flex flex-col gap-2", !centered && "sm:max-w-xl")}>
          {data.title ? (
            <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">
              {data.title}
            </h2>
          ) : null}
          {data.subtitle ? (
            <p className="text-foreground-muted">{data.subtitle}</p>
          ) : null}
        </div>
        {data.ctaLabel && data.ctaHref ? (
          <Button href={data.ctaHref} size="lg" className="shrink-0">
            {data.ctaLabel}
          </Button>
        ) : null}
      </div>
    </motion.section>
  );
}

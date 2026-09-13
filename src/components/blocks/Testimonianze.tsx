"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { pickTextColors } from "@/lib/contrast";
import type { TestimonianzeBlockData } from "@/lib/types";

/**
 * Blocco "Testimonianze": griglia di citazioni brevi con autore/ruolo.
 * Fase B del sistema di blocchi — vedi HomeContent.blocks.
 */
export function Testimonianze({ data }: { data: TestimonianzeBlockData }) {
  if (!data.items || data.items.length === 0) return null;
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
      {data.title ? (
        <h2
          style={colors ? { color: colors.text } : undefined}
          className={clsx(
            "font-display mb-12 text-3xl font-semibold tracking-tight sm:text-4xl",
            centered && "text-center",
          )}
        >
          {data.title}
        </h2>
      ) : null}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {data.items.map((item, i) => (
          <figure
            key={i}
            style={colors ? { borderColor: colors.border } : undefined}
            className="flex flex-col gap-4 border border-border-strong p-6"
          >
            <blockquote
              style={colors ? { color: colors.text } : undefined}
              className="text-foreground"
            >
              &ldquo;{item.quote}&rdquo;
            </blockquote>
            <figcaption
              style={colors ? { color: colors.muted } : undefined}
              className="mt-auto text-sm text-foreground-muted"
            >
              <span
                style={colors ? { color: colors.text } : undefined}
                className="font-medium text-foreground"
              >
                {item.author}
              </span>
              {item.role ? <>, {item.role}</> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </motion.section>
  );
}

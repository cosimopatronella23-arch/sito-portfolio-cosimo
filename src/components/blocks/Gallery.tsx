"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { CoverImage } from "@/components/ui/CoverImage";
import { pickTextColors } from "@/lib/contrast";
import type { GalleryBlockData } from "@/lib/types";

/**
 * Blocco "Gallery": griglia di immagini. Fase B del sistema di blocchi —
 * vedi HomeContent.blocks.
 */
export function Gallery({ data }: { data: GalleryBlockData }) {
  const images = (data.images ?? []).filter(Boolean);
  if (images.length === 0) return null;
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
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {images.map((src, i) => (
          <CoverImage
            key={src + i}
            src={src}
            alt=""
            index={i}
            className="aspect-square"
            sizes="(min-width: 640px) 33vw, 50vw"
          />
        ))}
      </div>
    </motion.section>
  );
}

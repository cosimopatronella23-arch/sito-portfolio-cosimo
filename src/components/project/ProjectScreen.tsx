"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import type { Project } from "@/lib/types";

/**
 * Un progetto = uno schermo intero, "sticky": resta fermo in cima finché il
 * progetto successivo non gli scorre sopra e lo copre. Effetto a pila,
 * niente griglia.
 */
export function ProjectScreen({
  project,
  index = 0,
  total = 1,
}: {
  project: Project;
  index?: number;
  total?: number;
}) {
  return (
    <Link
      href={`/progetti/${project.slug}`}
      data-cursor="link"
      style={{ zIndex: index + 1 }}
      className="group sticky top-0 flex h-[85svh] w-full items-end overflow-hidden shadow-[0_-1px_40px_rgba(0,0,0,0.5)] sm:h-screen"
    >
      <motion.div
        className="absolute inset-0"
        initial={{ scale: 1.18 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <CoverImage
          src={project.cover_image}
          alt={project.title}
          index={index}
          priority={index === 0}
          className="h-full w-full transition-[filter] duration-500 ease-out group-hover:brightness-110"
        />
      </motion.div>

      <div
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
        aria-hidden="true"
      />

      <span className="font-display container-px absolute top-6 text-sm text-white/60 sm:top-10">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="container-px relative mb-10 flex w-full flex-col gap-4 pt-6 sm:mb-16 sm:flex-row sm:items-end sm:justify-between sm:pt-10"
      >
        <div className="flex flex-col gap-2">
          <span className="text-sm text-white/70">
            {project.category} — {project.year}
          </span>
          <h3 className="font-display text-4xl leading-[1.05] font-semibold text-balance text-white sm:text-6xl md:text-7xl">
            {project.title}
          </h3>
        </div>
        <span className="inline-flex w-max items-center gap-2 border border-white/40 px-5 py-2.5 text-sm font-medium text-white transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-background">
          Vedi progetto →
        </span>
      </motion.div>
    </Link>
  );
}

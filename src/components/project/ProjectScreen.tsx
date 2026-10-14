"use client";

import Link from "next/link";
import clsx from "clsx";
import { motion, useReducedMotion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import { Shape, type ShapeKind } from "@/components/dumbar/Shapes";
import type { Project } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Una forma diversa per ogni progetto, a rotazione, nei colori del sito.
const SHAPES: { kind: ShapeKind; color: string; hover: string }[] = [
  { kind: "circle", color: "bg-secondary", hover: "group-hover:scale-110" },
  { kind: "square", color: "bg-accent", hover: "group-hover:rotate-45" },
  { kind: "quarter", color: "bg-secondary", hover: "group-hover:-rotate-90" },
  { kind: "ring", color: "border-paper", hover: "group-hover:scale-90" },
];

/**
 * Un progetto = uno schermo intero "sticky": resta fermo finché il
 * successivo non gli scorre sopra (effetto a pila). Nel linguaggio del
 * sito: foto a colori, contatore, etichetta corallo, forma geometrica che
 * reagisce al mouse e pulsante squadrato che si riempie.
 */
export function ProjectScreen({
  project,
  index = 0,
  total = 1,
  isNew = false,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  index?: number;
  total?: number;
  isNew?: boolean;
  headingLevel?: "h2" | "h3";
}) {
  const reduce = useReducedMotion();
  const shape = SHAPES[index % SHAPES.length];

  return (
    <Link
      href={`/progetti/${project.slug}`}
      data-cursor="link"
      style={{ zIndex: index + 1 }}
      className="group sticky top-0 flex h-[85svh] w-full items-end overflow-hidden bg-ink sm:h-screen"
    >
      <motion.div
        className="absolute inset-0"
        initial={reduce ? false : { scale: 1.15 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.6, ease: EASE_OUT }}
      >
        <CoverImage
          src={project.cover_image}
          alt={project.title}
          index={index}
          priority={index === 0}
          className="h-full w-full transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
        />
      </motion.div>

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-black/30"
      />

      {/* In alto: contatore, etichette e forma del progetto. */}
      {/* Sotto la barra di navigazione, che resta fissa sopra lo schermo. */}
      <div className="container-px absolute inset-x-0 top-24 flex items-start justify-between gap-6 sm:top-28">
        <span className="font-display text-sm font-semibold text-paper/80 tabular-nums">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
        <span className="flex flex-col items-end gap-5">
          <span className="flex gap-2">
            {isNew ? (
              <span className="bg-paper px-3 py-1.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
                Nuovo
              </span>
            ) : null}
            <span className="bg-secondary px-3 py-1.5 text-xs font-semibold tracking-[0.1em] text-ink uppercase">
              {project.category}
            </span>
          </span>
          <Shape
            kind={shape.kind}
            color={shape.color}
            float={index % 2 === 0 ? "fast" : "slow"}
            className={clsx("hidden size-16 sm:block lg:size-20", shape.hover)}
          />
        </span>
      </div>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 0.9, ease: EASE_OUT }}
        className="container-px relative mb-10 flex w-full flex-col gap-6 sm:mb-16 lg:flex-row lg:items-end lg:justify-between"
      >
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold tracking-[0.14em] text-paper/75 uppercase">
            {project.client && project.client !== project.title ? `${project.client} · ` : ""}
            {project.year}
          </span>
          <Heading className="font-display max-w-4xl text-[clamp(2.5rem,7vw,7rem)] leading-[0.92] font-bold tracking-[-0.045em] text-balance text-paper">
            {project.title}
          </Heading>
        </div>
        <span className="relative inline-flex w-max shrink-0 items-center gap-3 overflow-hidden border border-paper px-6 py-3.5 text-sm font-semibold tracking-[0.06em] text-paper uppercase transition-colors duration-300 group-hover:text-ink">
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-left scale-x-0 bg-accent transition-transform duration-300 ease-out group-hover:scale-x-100"
          />
          <span className="relative">Vedi il progetto</span>
          <span aria-hidden="true" className="relative transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </span>
      </motion.div>
    </Link>
  );
}

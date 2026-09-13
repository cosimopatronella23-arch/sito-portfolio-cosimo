"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import type { Project } from "@/lib/types";

/**
 * Variante a 2 colonne di ProjectScreen, usata solo su desktop nella pagina
 * /progetti (l'elenco completo) — su mobile la stessa pagina torna a usare
 * ProjectScreen (una colonna a schermo intero), perché due riquadri affiancati
 * dentro un'unica schermata sticky non hanno spazio per un'immagine leggibile
 * sotto una certa larghezza. Stessa animazione e stesso linguaggio visivo
 * della homepage, solo raddoppiata per restare leggibile quando i progetti
 * pubblicati crescono di numero. Se la coppia ha un solo progetto (numero
 * dispari), quello occupa l'intera larghezza invece di lasciare una colonna
 * vuota.
 */
export function ProjectPairScreen({
  projects,
  index = 0,
  total = 1,
}: {
  projects: Project[];
  index?: number;
  total?: number;
}) {
  return (
    <div
      style={{ zIndex: index + 1 }}
      className="sticky top-0 grid h-screen w-full grid-cols-2 overflow-hidden shadow-[0_-1px_40px_rgba(0,0,0,0.5)]"
    >
      <span className="font-display container-px pointer-events-none absolute top-6 z-10 text-sm text-white/60 sm:top-10">
        {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
      </span>

      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/progetti/${project.slug}`}
          data-cursor="link"
          data-cursor-text="Vedi progetto"
          className={`group relative flex items-end overflow-hidden ${
            projects.length === 1 ? "col-span-2" : ""
          }`}
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
              className="h-full w-full transition-[filter] duration-500 ease-out group-hover:brightness-110"
            />
          </motion.div>

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent"
            aria-hidden="true"
          />

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20%" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mb-8 flex w-full flex-col gap-3 px-6 sm:mb-12 sm:px-8"
          >
            <span className="text-sm text-white/70">
              {project.category} — {project.year}
            </span>
            <h3 className="font-display text-3xl leading-[1.05] font-semibold text-balance text-white sm:text-4xl">
              {project.title}
            </h3>
            <span className="inline-flex w-max items-center gap-2 border border-white/40 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 group-hover:border-white group-hover:bg-white group-hover:text-background">
              Vedi progetto →
            </span>
          </motion.div>
        </Link>
      ))}
    </div>
  );
}

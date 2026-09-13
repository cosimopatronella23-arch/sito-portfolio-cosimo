"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { CoverImage } from "@/components/ui/CoverImage";
import { ProjectMediaGallery } from "./ProjectMediaGallery";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Pagina progetto: un case study immersivo, non un articolo. A differenza
 * del blog (colonna stretta, il testo è il protagonista), qui la copertina
 * apre a quasi tutto schermo e la galleria torna a piena larghezza — sono le
 * immagini a raccontare il lavoro, il testo le accompagna in una colonna
 * leggibile in mezzo. Le due pagine devono sembrare due format diversi, non
 * lo stesso template con contenuti diversi.
 */
export function ProjectDetail({ project }: { project: Project }) {
  // La copertina resta "agganciata" in cima mentre si scorre, restringendosi
  // leggermente (scroll-linked, non scroll-jacking: lo scroll nativo non
  // viene mai intercettato, si legge solo quanto si è avanzati per pilotare
  // una trasformazione). Bloccato con prefers-reduced-motion.
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroWrapperRef,
    offset: ["start start", "end start"],
  });
  // Lo "sgancio" dallo sticky avviene a circa metà del wrapper (la cui
  // altezza è volutamente quasi doppia rispetto alla copertina): il
  // restringimento deve completarsi entro quel punto, non oltre — altrimenti
  // si fermerebbe a metà effetto quando la copertina torna a scorrere con
  // il resto della pagina.
  const heroScale = useTransform(scrollYProgress, [0, 0.45], [1, 0.92]);

  return (
    <article className="pb-20 sm:pb-28">
      <div ref={heroWrapperRef} className="relative h-[130vh] sm:h-[170vh]">
        <motion.div
          style={shouldReduceMotion ? undefined : { scale: heroScale }}
          className="sticky top-0 h-[70svh] w-full origin-top overflow-hidden sm:h-[90vh]"
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4, ease: EASE_OUT }}
          >
            <CoverImage
              src={project.cover_image}
              alt={project.title}
              priority
              className="h-full w-full"
            />
          </motion.div>

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/40"
            aria-hidden="true"
          />

          <Link
            href="/#progetti"
            className="container-px absolute top-6 z-10 w-max text-sm text-white/70 transition-colors hover:text-white sm:top-10"
          >
            ← Torna ai progetti
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE_OUT, delay: 0.2 }}
            className="container-px absolute bottom-10 flex flex-col gap-4 sm:bottom-14"
          >
            <p className="text-xs font-medium tracking-wide text-accent uppercase">
              {project.category} — {project.year}
            </p>
            <h1 className="font-display max-w-3xl text-4xl leading-[1.05] font-semibold text-balance text-white sm:text-6xl md:text-7xl">
              {project.title}
            </h1>
          </motion.div>
        </motion.div>
      </div>

      <div className="container-px flex flex-col gap-16 pt-16 sm:gap-20 sm:pt-20">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
          <p className="text-lg text-foreground-muted">
            {project.short_description}
          </p>
          <dl className="flex flex-wrap gap-x-10 gap-y-3 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-foreground-muted">Cliente</dt>
              <dd className="font-medium">{project.client}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Anno</dt>
              <dd className="font-medium">{project.year}</dd>
            </div>
          </dl>
        </div>

        {project.gallery.length > 0 ? (
          <div className="mx-[calc(50%-50vw)] w-screen">
            <ProjectMediaGallery items={project.gallery} alt={project.title} />
          </div>
        ) : null}

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-12">
          {project.content_blocks.map((block) => (
            <motion.section
              key={block.heading}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, ease: EASE_OUT }}
              className="flex flex-col gap-3"
            >
              <h2 className="font-display text-2xl font-semibold">
                {block.heading}
              </h2>
              <p className="max-w-2xl text-base leading-relaxed text-foreground-muted">
                {block.body}
              </p>
            </motion.section>
          ))}

          {project.external_link ? (
            <Button
              href={project.external_link}
              variant="secondary"
              size="lg"
              className="w-max"
            >
              Visita il sito →
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
}

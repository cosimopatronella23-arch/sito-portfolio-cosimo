"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProjectMediaGallery } from "./ProjectMediaGallery";
import { Button } from "@/components/ui/Button";
import type { Project } from "@/lib/types";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function ProjectDetail({ project }: { project: Project }) {
  return (
    <article className="container-px py-20 sm:py-28">
      {/* Stessa larghezza per testo e galleria: prima le foto sfondavano a
          piena larghezza mentre il testo restava stretto, facendo sembrare
          le immagini più grandi e importanti di tutto il resto. */}
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <Link
          href="/#progetti"
          className="w-max text-sm text-foreground-muted hover:text-foreground"
        >
          ← Torna ai progetti
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: EASE_OUT }}
          className="flex flex-col gap-5"
        >
          <p className="text-xs font-medium tracking-wide text-accent uppercase">
            {project.category}
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            {project.title}
          </h1>
          <p className="max-w-2xl text-lg text-foreground-muted">
            {project.short_description}
          </p>
          <dl className="mt-2 flex flex-wrap gap-x-10 gap-y-3 border-t border-border pt-6 text-sm">
            <div>
              <dt className="text-foreground-muted">Cliente</dt>
              <dd className="font-medium">{project.client}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Anno</dt>
              <dd className="font-medium">{project.year}</dd>
            </div>
          </dl>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.1 }}
        >
          <ProjectMediaGallery
            items={[
              ...(project.cover_image
                ? [{ url: project.cover_image, layout: "full" as const }]
                : []),
              ...project.gallery,
            ]}
            alt={project.title}
          />
        </motion.div>

        <div className="flex flex-col gap-12">
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
        </div>

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
    </article>
  );
}

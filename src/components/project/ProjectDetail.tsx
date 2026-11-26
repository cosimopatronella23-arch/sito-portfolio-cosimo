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
import type { ClientReview, Project } from "@/lib/types";
import { Stars } from "@/components/reviews/ReviewQuote";
import { SiteLink } from "./SiteLink";
import { normalizeHeadings } from "@/lib/html";

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

/**
 * Pagina progetto: un case study immersivo, non un articolo. A differenza
 * del blog (colonna stretta, il testo è il protagonista), qui la copertina
 * apre a quasi tutto schermo e la galleria torna a piena larghezza — sono le
 * immagini a raccontare il lavoro, il testo le accompagna in una colonna
 * leggibile in mezzo. Le due pagine devono sembrare due format diversi, non
 * lo stesso template con contenuti diversi.
 */
export function ProjectDetail({
  project,
  services = [],
  review,
}: {
  project: Project;
  /** Recensione del cliente collegata a questo progetto, se c'è. */
  review?: ClientReview;
  /** Servizi pubblicati che citano questo progetto come esempio. */
  services?: { slug: string; title: string }[];
}) {
  // La copertina resta "agganciata" in cima mentre si scorre, restringendosi
  // leggermente (scroll-linked, non scroll-jacking: lo scroll nativo non
  // viene mai intercettato, si legge solo quanto si è avanzati per pilotare
  // una trasformazione). Bloccato con prefers-reduced-motion.
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  // Galleria e testi: servono a SiteLink per sapere se sono stati sfogliati.
  const contentRef = useRef<HTMLDivElement>(null);
  const hasContent =
    project.gallery.length > 0 || project.content_blocks.length > 0;
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
    <article className="pb-[60px] lg:pb-[120px]">
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
            className="container-px absolute top-[83px] z-10 w-max py-3 text-sm text-white/70 transition-colors hover:text-white sm:top-[95px]"
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

      {/* Spaziature sul modello delle pagine progetto di Studio Dumbar:
          margini laterali stretti, testi su una griglia a 12 colonne
          (titoletti dal 25%, testo dal 50%), molto respiro verticale
          (60 px su telefono, 120 px su computer tra i blocchi principali)
          e media allineati a sinistra invece che a tutta pagina. */}
      <div className="container-px flex flex-col gap-[60px] pt-[60px] lg:gap-[120px] lg:pt-[120px]">
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-5 lg:gap-y-10">
          <p className="text-xl leading-[1.2] text-balance text-foreground lg:col-span-8 lg:text-[30px] xl:col-span-7">
            {project.short_description}
          </p>
          <dl className="flex flex-wrap gap-x-10 gap-y-3 text-sm lg:col-span-12 lg:text-base">
            <div>
              <dt className="text-foreground-muted">Cliente</dt>
              <dd className="font-medium">{project.client}</dd>
            </div>
            <div>
              <dt className="text-foreground-muted">Anno</dt>
              <dd className="font-medium">{project.year}</dd>
            </div>
            {project.category ? (
              <div>
                <dt className="text-foreground-muted">Ambito</dt>
                <dd className="font-medium">{project.category}</dd>
              </div>
            ) : null}
            {project.external_link ? (
              <div>
                <dt className="text-foreground-muted">Sito</dt>
                <dd className="font-medium">
                  <SiteLink
                    url={project.external_link}
                    label={hostname(project.external_link)}
                    contentRef={contentRef}
                  />
                </dd>
              </div>
            ) : null}
          </dl>
        </div>

        {hasContent ? (
          <div
            ref={contentRef}
            tabIndex={-1}
            role="region"
            aria-label="Il progetto"
            className="flex flex-col gap-[60px] outline-none lg:gap-[120px]"
          >
            {project.gallery.length > 0 ? (
              <ProjectMediaGallery items={project.gallery} alt={project.title} />
            ) : null}

            {project.content_blocks.length ? (
              <div className="flex flex-col gap-[60px] lg:gap-[100px]">
                {project.content_blocks.map((block, i) => (
                  <motion.section
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ duration: 0.7, ease: EASE_OUT }}
                    className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-x-5"
                  >
                    <h2 className="font-display text-xl font-semibold lg:col-span-3 lg:col-start-4 lg:text-[22px] lg:leading-[1.3]">
                      {block.heading}
                    </h2>
                    <div
                      className="prose-editor text-base leading-relaxed text-foreground-muted lg:col-span-5 lg:col-start-7 lg:text-lg"
                      dangerouslySetInnerHTML={{
                        __html: normalizeHeadings(block.body),
                      }}
                    />
                  </motion.section>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {review ? (
          // La recensione come manifesto: citazione grande, a tutta griglia,
          // con le virgolette in lavanda appese fuori dal testo.
          <motion.figure
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: EASE_OUT }}
            className="flex flex-col gap-8 border-t border-border pt-10 lg:grid lg:grid-cols-12 lg:gap-x-5 lg:pt-14"
          >
            <div className="lg:col-span-3 lg:pt-[0.9vw]">
              <Stars rating={review.rating} />
            </div>
            <blockquote className="font-display relative text-[clamp(1.75rem,3.6vw,3.5rem)] leading-[1.08] font-semibold tracking-[-0.035em] text-pretty lg:col-span-9">
              <span
                aria-hidden="true"
                className="absolute top-0 -left-[0.5em] hidden text-accent lg:block"
              >
                &ldquo;
              </span>
              <p>
                <span className="text-accent lg:hidden">&ldquo;</span>
                {review.text}
                <span className="text-accent">&rdquo;</span>
              </p>
            </blockquote>
            <figcaption className="text-sm text-foreground-muted lg:col-span-9 lg:col-start-4">
              <span className="font-medium text-foreground">{review.author}</span>
              {review.context ? <>{"\u00a0· "}{review.context}</> : null}
              <span className="block sm:inline">
                <span className="hidden sm:inline">{"\u00a0· "}</span>
                Recensione Google{reviewMonth(review.date) ? `, ${reviewMonth(review.date)}` : ""}
              </span>
            </figcaption>
          </motion.figure>
        ) : null}

        {services.length ? (
          // Titoli di coda del progetto: i servizi usati, in riga.
          <nav
            aria-label="Servizi usati in questo progetto"
            className="flex flex-col gap-3 border-t border-border pt-8"
          >
            <p className="text-xs font-medium tracking-[0.14em] text-foreground-muted uppercase">
              Servizi
            </p>
            <ul className="font-display flex flex-wrap items-baseline gap-x-2 gap-y-1 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
              {services.map((service, i) => (
                <li key={service.slug} className="flex items-baseline gap-x-2">
                  <Link
                    href={`/servizi/${service.slug}`}
                    data-cursor="link"
                    className="-my-2 py-2 transition-colors duration-200 hover:text-accent"
                  >
                    <span className="link-draw">{service.title}</span>
                  </Link>
                  {/* La barra chiude la voce: se si va a capo resta in
                      fondo alla riga, mai all'inizio della successiva. */}
                  {i < services.length - 1 ? (
                    <span aria-hidden="true" className="text-foreground-muted">/</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
      </div>
    </article>
  );
}


/** Dominio leggibile del sito del cliente ("www." tolto), o il link intero. */
function hostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

const monthFormat = new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" });

/** "2026-10" → "ottobre 2026" (stesso formato delle recensioni in home). */
function reviewMonth(value: string) {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return "";
  return monthFormat.format(new Date(y, m - 1, 1));
}

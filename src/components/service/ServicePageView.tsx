import Link from "next/link";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { WorkGrid } from "@/components/project/WorkGrid";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { normalizeHeadings } from "@/lib/html";
import { serviceJsonLd } from "@/lib/seo";
import type { Project, ServicePage } from "@/lib/types";

/**
 * Pagina di un servizio. Usata sia dalla pagina pubblica sia
 * dall'anteprima in /admin, così la bozza si vede esattamente come
 * apparirà online. Sezioni a colori alterni come la homepage: apertura,
 * testi su carta (titolo a sinistra, testo a destra), domande frequenti,
 * esempi reali e chiusura con il contatto.
 */
export function ServicePageView({
  service,
  projects,
  contactPhone,
}: {
  service: ServicePage;
  projects: Project[];
  contactPhone?: string;
}) {
  const areas = service.area_served
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd(service)),
        }}
      />

      <header className="theme-ink container-px pt-10 pb-16 sm:pt-14 sm:pb-24">
        <nav aria-label="Percorso" className="text-xs font-semibold tracking-[0.12em] text-foreground-muted uppercase">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="link-draw hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/servizi" className="link-draw hover:text-foreground">
                Servizi
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {service.title}
            </li>
          </ol>
        </nav>

        <div className="mt-10 sm:mt-14">
          <h1 className="font-display max-w-5xl text-[clamp(2.75rem,7vw,6.5rem)] leading-[0.92] font-bold tracking-[-0.045em] text-balance">
            <AnimatedText text={service.title} />
          </h1>
        </div>

        {service.intro || areas.length ? (
          <div className="mt-12 grid grid-cols-1 gap-8 border-t border-border-strong pt-8 sm:mt-16 lg:grid-cols-12 lg:gap-6">
            {service.intro ? (
              <p className="max-w-2xl text-lg leading-relaxed text-foreground/85 sm:text-xl lg:col-span-7">
                {service.intro}
              </p>
            ) : null}
            {areas.length ? (
              <p className="text-sm leading-relaxed text-foreground-muted lg:col-span-4 lg:col-start-9">
                <span className="mb-1 block text-xs font-semibold tracking-[0.12em] text-foreground uppercase">
                  Dove
                </span>
                {areas.join(", ")} e da remoto in tutta Italia
              </p>
            ) : null}
          </div>
        ) : null}
      </header>

      {service.content_blocks.length ? (
        <div className="theme-paper container-px py-20 sm:py-28">
          {service.content_blocks.map((block, i) => (
            <section
              key={i}
              className="grid grid-cols-1 gap-4 border-t border-border-strong py-10 first:border-t-0 first:pt-0 last:pb-0 sm:py-14 lg:grid-cols-12 lg:gap-6"
            >
              <div className="flex flex-col gap-3 lg:col-span-4">
                <span className="font-display text-sm font-semibold text-foreground-muted tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-2xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-3xl">
                  {block.heading}
                </h2>
              </div>
              <div
                className="prose-editor max-w-2xl text-base leading-relaxed text-foreground-muted sm:text-lg lg:col-span-7 lg:col-start-6"
                dangerouslySetInnerHTML={{ __html: normalizeHeadings(block.body) }}
              />
            </section>
          ))}
        </div>
      ) : null}

      {service.faqs.length ? (
        <section className="theme-ink container-px grid grid-cols-1 gap-10 py-20 sm:py-28 lg:grid-cols-12 lg:gap-6">
          <h2 className="font-display text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] lg:col-span-4">
            Domande frequenti.
          </h2>
          <div className="border-b border-border-strong lg:col-span-7 lg:col-start-6">
            {service.faqs.map((faq, i) => (
              <details key={i} className="group border-t border-border-strong">
                <summary
                  data-cursor="link"
                  className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-lg font-semibold transition-colors hover:text-accent [&::-webkit-details-marker]:hidden"
                >
                  <span>{faq.question}</span>
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center border border-foreground text-xl leading-none transition-[transform,background-color,color] duration-300 group-open:rotate-45 group-open:bg-foreground group-open:text-background"
                  >
                    +
                  </span>
                </summary>
                <p className="max-w-2xl pb-7 leading-relaxed whitespace-pre-line text-foreground-muted">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      {projects.length ? (
        <section className="theme-paper container-px py-20 sm:py-28">
          <h2 className="font-display mb-12 text-[clamp(2.25rem,5vw,4rem)] leading-[0.95] font-bold tracking-[-0.04em] sm:mb-16">
            Alcuni lavori.
          </h2>
          <WorkGrid projects={projects} />
        </section>
      ) : null}

      <ClosingCta
        title="Parliamo del tuo progetto."
        text="La prima consulenza è gratuita e senza impegno: mi racconti cosa ti serve e ti dico come lo farei."
        contactPhone={contactPhone}
      />
    </article>
  );
}

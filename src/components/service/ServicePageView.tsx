import Link from "next/link";
import { CoverImage } from "@/components/ui/CoverImage";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { Button } from "@/components/ui/Button";
import { normalizeHeadings } from "@/lib/html";
import { serviceJsonLd } from "@/lib/seo";
import type { Project, ServicePage } from "@/lib/types";

/**
 * Pagina di un servizio. Usata sia dalla pagina pubblica sia
 * dall'anteprima in /admin, così la bozza si vede esattamente come
 * apparirà online. Formato editoriale come il blog (colonna leggibile),
 * con in coda le domande frequenti, gli esempi reali e il contatto.
 */
export function ServicePageView({
  service,
  projects,
}: {
  service: ServicePage;
  projects: Project[];
}) {
  const areas = service.area_served
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  return (
    <article className="container-px py-20 sm:py-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceJsonLd(service)),
        }}
      />

      <div className="mx-auto flex max-w-3xl flex-col gap-10">
        <nav aria-label="Percorso" className="text-sm text-foreground-muted">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-foreground">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/servizi" className="hover:text-foreground">
                Servizi
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-foreground">
              {service.title}
            </li>
          </ol>
        </nav>

        <header className="flex flex-col gap-6">
          <h1 className="font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.02] font-semibold tracking-tight text-balance">
            <AnimatedText text={service.title} />
          </h1>
          {service.intro ? (
            <p className="text-lg leading-relaxed text-foreground-muted sm:text-xl">
              {service.intro}
            </p>
          ) : null}
          {areas.length ? (
            <p className="border-t border-border pt-5 text-sm text-foreground-muted">
              <span className="font-medium text-foreground">Dove: </span>
              {areas.join(", ")} e da remoto in tutta Italia
            </p>
          ) : null}
        </header>

        {service.content_blocks.map((block, i) => (
          <section key={i} className="flex flex-col gap-3">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              {block.heading}
            </h2>
            <div
              className="prose-editor text-base leading-relaxed text-foreground-muted"
              dangerouslySetInnerHTML={{ __html: normalizeHeadings(block.body) }}
            />
          </section>
        ))}

        {service.faqs.length ? (
          <section className="flex flex-col gap-4">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Domande frequenti
            </h2>
            <div className="border-b border-border">
              {service.faqs.map((faq, i) => (
                <details key={i} className="group border-t border-border">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-6 py-5 font-medium [&::-webkit-details-marker]:hidden">
                    <span>{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="mt-0.5 text-foreground-muted transition-transform duration-300 group-open:rotate-45"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-6 leading-relaxed whitespace-pre-line text-foreground-muted">
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {projects.length ? (
        <section className="mx-auto mt-20 flex max-w-5xl flex-col gap-8 sm:mt-28">
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">
            Alcuni lavori
          </h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-8">
            {projects.map((project, i) => (
              <li key={project.id}>
                <Link
                  href={`/progetti/${project.slug}`}
                  className="group flex flex-col gap-3 sm:gap-4"
                  data-cursor="link"
                >
                  <div className="aspect-[3/2] overflow-hidden border border-border-strong">
                    <CoverImage
                      src={project.cover_image}
                      alt={project.title}
                      index={i}
                      sizes="50vw"
                      className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-xs font-medium tracking-wide text-accent uppercase">
                      {project.category}
                    </p>
                    <p className="font-display text-base font-semibold sm:text-xl group-hover:underline group-hover:underline-offset-4">
                      {project.title}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mx-auto mt-20 flex max-w-3xl flex-col items-start gap-6 border-t border-border-strong pt-12 sm:mt-28">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Parliamo del tuo progetto
        </h2>
        <p className="text-lg text-foreground-muted">
          La prima consulenza è gratuita e senza impegno: mi racconti cosa ti
          serve e ti dico come lo farei.
        </p>
        <Button href="/#contatti" size="lg">
          Contattami
        </Button>
      </section>
    </article>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TitleArrow } from "@/components/ui/TitleArrow";
import { Button } from "@/components/ui/Button";
import { buildMetadata } from "@/lib/seo";
import { getPublishedServices } from "@/lib/data/services";
import { getSiteSettings } from "@/lib/data/settings";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Servizi di web design, grafica e SEO",
    description:
      "Siti web, identità visive, SEO, web app e gestione dei contenuti: i servizi di Cosimo Patronella, web designer a Roma, Grottaglie e Taranto.",
    path: "/servizi",
  });
}

export default async function ServicesIndexPage() {
  const [services, settings] = await Promise.all([
    getPublishedServices(),
    getSiteSettings(),
  ]);
  // Senza servizi pubblicati la pagina sarebbe vuota: meglio un 404 che
  // una pagina senza contenuto indicizzata da Google.
  if (services.length === 0) notFound();

  const intro = settings.home_content.services_intro;

  return (
    <div className="pt-20 pb-20 sm:pt-28 sm:pb-28">
      <div className="container-px flex flex-col gap-8">
        <SectionHeading
          title={settings.home_content.services_title || "Servizi."}
          size="poster"
          as="h1"
        />
        {intro ? (
          <p className="max-w-2xl text-lg leading-relaxed text-foreground-muted sm:text-xl">
            {intro}
          </p>
        ) : null}
      </div>

      <ul className="mt-14 flex flex-col">
        {services.map((service, i) => (
          <li
            key={service.id}
            className="border-t border-border last:border-b"
          >
            <Link
              href={`/servizi/${service.slug}`}
              data-cursor="link"
              className="group container-px flex flex-col gap-3 py-10 transition-colors hover:bg-foreground/[0.03] sm:flex-row sm:items-baseline sm:justify-between sm:gap-10 sm:py-14"
            >
              <div className="flex items-baseline gap-6">
                <span
                  aria-hidden="true"
                  className="font-display text-xl text-foreground-muted sm:text-2xl"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-5xl">
                  <TitleArrow text={service.title} />
                </h2>
              </div>
              <p className="max-w-sm text-foreground-muted sm:text-right">
                {service.excerpt}
              </p>
            </Link>
          </li>
        ))}
      </ul>

      <section className="container-px mt-20 flex flex-col items-start gap-6 sm:mt-28">
        <h2 className="font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Non sai da dove iniziare?
        </h2>
        <p className="max-w-2xl text-lg text-foreground-muted">
          Prima di ogni progetto c&apos;è una consulenza gratuita: capiamo
          insieme cosa ti serve davvero, anche se è solo un&apos;idea.
        </p>
        <Button href="/#contatti" size="lg">
          Contattami
        </Button>
      </section>
    </div>
  );
}

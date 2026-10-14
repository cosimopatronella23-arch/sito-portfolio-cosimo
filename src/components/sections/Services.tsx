import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import type { SectionTheme, ServiceItem } from "@/lib/types";

/**
 * Servizi in homepage: una colonna per servizio, solo testo. Con un link
 * (impostato in /admin) l'intera colonna è cliccabile e si illumina al
 * passaggio del mouse.
 */
export function Services({
  title,
  services,
  theme,
}: {
  title: string;
  services: ServiceItem[];
  theme: SectionTheme;
}) {
  if (services.length === 0) return null;
  const cols =
    services.length >= 5 ? "lg:grid-cols-5" : services.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3";

  return (
    <section id="servizi" className={`theme-${theme} container-px py-24 sm:py-32`}>
      <div className="flex flex-wrap items-end justify-between gap-6 pb-12 sm:pb-16">
        <SectionHeading title={title} size="poster" />
        <span className="font-display text-base font-semibold text-foreground-muted">
          {String(services.length).padStart(2, "0")} servizi
        </span>
      </div>

      <div className={`grid grid-cols-1 border-t border-border-strong sm:grid-cols-2 ${cols}`}>
        {services.map((service, i) => {
          const body = (
            <>
              <h3 className="font-display text-2xl leading-[1.05] font-bold tracking-[-0.03em]">
                {service.title}
              </h3>
              <p className="leading-relaxed text-foreground-muted">{service.description}</p>
              {service.href ? (
                <span className="mt-auto flex items-center gap-2 pt-4 text-xs font-semibold tracking-[0.12em] uppercase">
                  Scopri
                  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
                    →
                  </span>
                </span>
              ) : null}
            </>
          );
          const cell =
            "group flex flex-col gap-4 border-b border-border-strong py-8 transition-colors duration-300 sm:px-6 sm:[&:nth-child(2n)]:border-l lg:border-l lg:first:border-l-0 lg:first:pl-0 lg:[&:nth-child(2n)]:border-l";
          return service.href ? (
            <Link key={`${i}-${service.title}`} href={service.href} data-cursor="link" className={`${cell} hover:bg-surface-hover`}>
              {body}
            </Link>
          ) : (
            <div key={`${i}-${service.title}`} className={cell}>
              {body}
            </div>
          );
        })}
      </div>
    </section>
  );
}

import Link from "next/link";
import { AnimatedText } from "@/components/ui/AnimatedText";
import { getSiteSettings } from "@/lib/data/settings";
import { getPublishedServices } from "@/lib/data/services";
import { formatPhone, phoneHref } from "@/lib/phone";

export async function Footer() {
  const [siteSettings, services] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
  ]);
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container-px pt-16 pb-10 sm:pt-20">
        <a
          href={`mailto:${siteSettings.contact_email}`}
          data-cursor="link"
          data-cursor-text="Scrivimi"
          className="font-display block text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] font-semibold tracking-tight text-balance underline decoration-border-strong underline-offset-8 transition-colors hover:text-accent hover:decoration-accent"
        >
          <AnimatedText text="Parliamo del tuo progetto." />
        </a>
      </div>

      <div className="container-px flex flex-col gap-8 pb-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-3">
          <span className="font-display text-lg font-semibold">
            Cosimo Patronella
          </span>
          <p className="max-w-sm text-sm text-foreground-muted">
            {siteSettings.home_content.footer_tagline ||
              "Disegno e sviluppo siti su misura, dal primo schizzo al giorno in cui li metti online."}
          </p>
          {siteSettings.contact_phone ? (
            <a
              href={phoneHref(siteSettings.contact_phone)}
              data-cursor="link"
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              {formatPhone(siteSettings.contact_phone)}
            </a>
          ) : null}
        </div>

        {services.length ? (
          <nav aria-label="Servizi" className="flex flex-col gap-3">
            <Link
              href="/servizi"
              className="text-xs font-medium tracking-[0.08em] text-foreground uppercase hover:text-accent"
            >
              Servizi
            </Link>
            <ul className="flex flex-col gap-2">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/servizi/${service.slug}`}
                    className="text-sm text-foreground-muted hover:text-foreground"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ) : null}

        <div className="flex flex-col gap-4">
          <div className="flex gap-5">
            {Object.entries(siteSettings.social_links).map(([name, url]) => (
              <a
                key={name}
                href={url}
                data-cursor="link"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm text-foreground-muted capitalize hover:text-foreground"
              >
                {name}
              </a>
            ))}
          </div>
          <p className="text-xs text-foreground-muted">
            © {year} Cosimo Patronella. Tutti i diritti riservati.
          </p>
        </div>
      </div>
      <div className="container-px flex flex-wrap items-center justify-between gap-4 pb-8">
        <Link
          href="#top"
          className="text-xs text-foreground-muted hover:text-foreground"
        >
          Torna su ↑
        </Link>
        <div className="flex gap-5">
          <Link
            href="/privacy-policy"
            className="text-xs text-foreground-muted hover:text-foreground"
          >
            Privacy Policy
          </Link>
          <Link
            href="/cookie-policy"
            className="text-xs text-foreground-muted hover:text-foreground"
          >
            Cookie Policy
          </Link>
        </div>
      </div>
    </footer>
  );
}

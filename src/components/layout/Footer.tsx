import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";

export async function Footer() {
  const siteSettings = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      <div className="container-px pt-16 pb-10 sm:pt-20">
        <a
          href={`mailto:${siteSettings.contact_email}`}
          data-cursor="link"
          data-cursor-text="Scrivimi"
          className="font-display block text-4xl font-semibold tracking-tight text-balance underline decoration-border-strong underline-offset-8 transition-colors hover:text-accent hover:decoration-accent sm:text-5xl md:text-6xl"
        >
          Parliamo del tuo progetto.
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
        </div>

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
      <div className="container-px pb-8">
        <Link
          href="#top"
          className="text-xs text-foreground-muted hover:text-foreground"
        >
          Torna su ↑
        </Link>
      </div>
    </footer>
  );
}

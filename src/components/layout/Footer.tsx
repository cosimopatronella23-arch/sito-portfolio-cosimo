import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { getPublishedServices } from "@/lib/data/services";
import { formatPhone, phoneHref, whatsappHref } from "@/lib/phone";
import { Shape } from "@/components/dumbar/Shapes";

// Nomi mostrati per i link non social (il resto usa il nome della chiave).
const SOCIAL_LABELS: Record<string, string> = { google: "Recensioni Google" };

const colTitle = "font-display mb-4 text-sm font-semibold text-foreground";
const colLink = "link-draw w-max text-sm text-foreground-muted transition-colors hover:text-foreground";

export async function Footer() {
  const [siteSettings, services] = await Promise.all([
    getSiteSettings(),
    getPublishedServices(),
  ]);
  const year = new Date().getFullYear();
  const phone = siteSettings.contact_phone;

  return (
    <footer className="theme-ink border-t border-border">
      <div className="container-px flex flex-col gap-10 pt-16 pb-12 sm:pt-20 lg:flex-row lg:items-end lg:justify-between">
        <a
          href={`mailto:${siteSettings.contact_email}`}
          data-cursor="link"
          className="font-display w-max max-w-full text-[clamp(1.05rem,5vw,4.5rem)] leading-none font-bold tracking-[-0.04em] [overflow-wrap:anywhere]"
        >
          <span className="link-draw">{siteSettings.contact_email}</span>
        </a>
        <span className="flex items-end gap-3" aria-hidden="true">
          <Shape kind="circle" color="bg-secondary" className="size-10 hover:scale-110 sm:size-12" />
          <Shape kind="square" color="bg-accent" className="size-10 hover:rotate-45 sm:size-12" />
          <Shape kind="quarter" color="bg-foreground" className="size-10 hover:-rotate-90 sm:size-12" />
        </span>
      </div>

      <div className="container-px grid grid-cols-2 gap-x-6 gap-y-10 border-t border-border py-12 md:grid-cols-4">
        <div className="col-span-2 flex flex-col gap-3 md:col-span-1">
          <p className={colTitle}>Cosimo Patronella</p>
          <p className="max-w-xs text-sm leading-relaxed text-foreground-muted">
            {siteSettings.home_content.footer_tagline ||
              "Disegno e sviluppo siti su misura, dal primo schizzo al giorno in cui li metti online."}
          </p>
          {phone ? (
            <a href={phoneHref(phone)} data-cursor="link" className={colLink}>
              {formatPhone(phone)}
            </a>
          ) : null}
          {phone ? (
            <a href={whatsappHref(phone)} target="_blank" rel="noopener noreferrer" data-cursor="link" className={colLink}>
              WhatsApp
            </a>
          ) : null}
        </div>

        {services.length ? (
          <nav aria-label="Servizi" className="flex flex-col gap-2">
            <Link href="/servizi" className={colTitle}>
              Servizi
            </Link>
            {services.map((service) => (
              <Link key={service.slug} href={`/servizi/${service.slug}`} className={colLink}>
                {service.title}
              </Link>
            ))}
          </nav>
        ) : null}

        <nav aria-label="Sito" className="flex flex-col gap-2">
          <p className={colTitle}>Sito</p>
          <Link href="/progetti" className={colLink}>Progetti</Link>
          <Link href="/blog" className={colLink}>Blog</Link>
          <Link href="/#contatti" className={colLink}>Contatti</Link>
        </nav>

        <nav aria-label="Profili" className="flex flex-col gap-2">
          <p className={colTitle}>Seguimi</p>
          {Object.entries(siteSettings.social_links).map(([name, url]) => (
            <a key={name} href={url} target="_blank" rel="noreferrer noopener" data-cursor="link" className={`${colLink} capitalize`}>
              {SOCIAL_LABELS[name] ?? name}
            </a>
          ))}
        </nav>
      </div>

      <div className="container-px flex flex-wrap items-center justify-between gap-4 border-t border-border py-6 text-xs text-foreground-muted">
        <p>© {year} Cosimo Patronella</p>
        <div className="flex gap-5">
          <Link href="/privacy-policy" className="link-draw hover:text-foreground">Privacy Policy</Link>
          <Link href="/cookie-policy" className="link-draw hover:text-foreground">Cookie Policy</Link>
          <Link href="#top" className="link-draw hover:text-foreground">Torna su ↑</Link>
        </div>
      </div>
    </footer>
  );
}

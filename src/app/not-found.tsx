import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { getSiteSettings } from "@/lib/data/settings";

export const metadata: Metadata = {
  title: "Pagina non trovata | Cosimo Patronella",
  robots: { index: false, follow: true },
};

/**
 * Pagina per gli indirizzi che non esistono (link vecchi o scritti male):
 * invece della pagina standard di Next.js in inglese, un messaggio chiaro
 * con menu, footer e le strade principali per tornare al sito.
 */
export default async function NotFound() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header navLinks={settings.home_content.nav_links} />
      <main id="contenuto" className="flex-1">
        <section className="container-px flex min-h-[60svh] flex-col justify-center gap-8 py-24 sm:py-32">
          <p className="font-display text-sm font-medium tracking-wide text-accent uppercase">
            Errore 404
          </p>
          <h1 className="font-display max-w-3xl text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-6xl">
            Questa pagina non esiste.
          </h1>
          <p className="max-w-xl text-lg text-foreground-muted">
            Forse il link è vecchio o c&apos;è un errore di battitura
            nell&apos;indirizzo. Da qui puoi tornare a quello che cercavi.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button href="/" size="lg">
              Torna alla home
            </Button>
            <Button href="/progetti" variant="secondary" size="lg">
              Guarda i progetti
            </Button>
            <Button href="/#contatti" variant="ghost" size="lg">
              Scrivimi
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

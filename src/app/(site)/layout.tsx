import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { getSiteSettings } from "@/lib/data/settings";
import { customColorsCss } from "@/lib/siteColors";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  // Nelle pagine interne solo il nome ("Cosimo Patronella"), non l'intero
  // titolo del sito: Google taglia intorno ai 60 caratteri, e il suffisso
  // lungo finiva per nascondere la parte importante del titolo.
  const brand = settings.site_title.split(" — ")[0];

  return {
    title: {
      default: settings.site_title,
      template: `%s | ${brand}`,
    },
    verification: settings.google_site_verification_code
      ? { google: settings.google_site_verification_code }
      : undefined,
  };
}

// Le pagine pubbliche possono essere rigenerate ogni ora invece che ad ogni
// visita: le modifiche da /admin restano istantanee comunque, grazie a
// revalidatePath() già richiamato dalle Server Action.
export const revalidate = 3600;

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const customColors = customColorsCss(settings);

  return (
    <>
      {/* Colori personalizzabili da /admin/impostazioni. */}
      {customColors ? <style>{`:root { ${customColors} }`}</style> : null}
      {/* Invisibile finché non si preme Tab: permette a chi usa tastiera o
          screen reader di saltare il menu e andare subito ai contenuti. */}
      <a
        href="#contenuto"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[1000] focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-background"
      >
        Salta al contenuto
      </a>
      <SmoothScrollProvider />
      <CustomCursor />
      <Header navLinks={settings.home_content.nav_links} />
      <main id="contenuto" tabIndex={-1} className="flex-1 focus:outline-none">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <GoogleAnalytics measurementId={settings.ga4_measurement_id} />
    </>
  );
}

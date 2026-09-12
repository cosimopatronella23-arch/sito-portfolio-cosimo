import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CustomCursor } from "@/components/cursor/CustomCursor";
import { SmoothScrollProvider } from "@/components/motion/SmoothScrollProvider";
import { PageTransition } from "@/components/motion/PageTransition";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { getSiteSettings } from "@/lib/data/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();

  return {
    title: {
      default: settings.site_title,
      template: `%s | ${settings.site_title}`,
    },
    verification: settings.google_site_verification_code
      ? { google: settings.google_site_verification_code }
      : undefined,
  };
}

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

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
  const accent = HEX_COLOR_REGEX.test(settings.accent_color)
    ? settings.accent_color
    : null;

  return (
    <>
      {/* Colore accento personalizzabile da /admin/impostazioni. */}
      {accent ? (
        <style>{`:root { --accent: ${accent}; --accent-strong: ${accent}; }`}</style>
      ) : null}
      <SmoothScrollProvider />
      <CustomCursor />
      <Header navLinks={settings.home_content.nav_links} />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <GoogleAnalytics measurementId={settings.ga4_measurement_id} />
    </>
  );
}

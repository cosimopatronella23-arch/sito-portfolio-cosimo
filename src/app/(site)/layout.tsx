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
  const background = HEX_COLOR_REGEX.test(
    settings.home_content.background_color ?? "",
  )
    ? settings.home_content.background_color
    : null;
  const foreground = HEX_COLOR_REGEX.test(
    settings.home_content.foreground_color ?? "",
  )
    ? settings.home_content.foreground_color
    : null;
  const customColors = [
    accent ? `--accent: ${accent}; --accent-strong: ${accent};` : "",
    background ? `--background: ${background};` : "",
    foreground ? `--foreground: ${foreground};` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      {/* Colori personalizzabili da /admin/impostazioni. */}
      {customColors ? <style>{`:root { ${customColors} }`}</style> : null}
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

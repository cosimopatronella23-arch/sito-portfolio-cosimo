import type { SiteSettings } from "@/lib/types";

const HEX_COLOR_REGEX = /^#[0-9a-fA-F]{6}$/;

/**
 * Colori personalizzati da /admin/impostazioni, come variabili CSS da
 * mettere in :root. Usato dal layout del sito e dalle anteprime in /admin,
 * così l'anteprima mostra gli stessi colori delle pagine online.
 */
export function customColorsCss(settings: SiteSettings): string {
  const pick = (v?: string | null) => (v && HEX_COLOR_REGEX.test(v) ? v : null);
  const accent = pick(settings.accent_color);
  const background = pick(settings.home_content.background_color);
  const foreground = pick(settings.home_content.foreground_color);
  return [
    accent ? `--accent: ${accent}; --accent-strong: ${accent};` : "",
    background ? `--background: ${background};` : "",
    foreground ? `--foreground: ${foreground};` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

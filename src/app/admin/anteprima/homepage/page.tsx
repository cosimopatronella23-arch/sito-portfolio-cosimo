import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HomeSections } from "@/components/home/HomeSections";
import { getReelItems } from "@/components/sections/HeroReel";
import { getSiteSettings } from "@/lib/data/settings";
import { customColorsCss } from "@/lib/siteColors";
import { applySettingsGroups } from "@/lib/settingsPatch";

// Sempre i dati appena salvati, mai una copia in cache.
export const dynamic = "force-dynamic";

/**
 * Anteprima dal vivo della homepage per l'editor delle sezioni
 * (/admin/homepage/...). Mostra la homepage con le modifiche non ancora
 * salvate, passate nell'indirizzo come "bozza" e applicate con le stesse
 * regole del salvataggio. Solo per l'amministratore (protetta dal proxy),
 * non scrive nulla.
 */
export default async function HomepagePreview(
  props: PageProps<"/admin/anteprima/homepage">,
) {
  const params = await props.searchParams;
  const settings = await getSiteSettings();
  let content = settings.home_content;

  const raw = typeof params.bozza === "string" ? params.bozza : "";
  if (raw) {
    try {
      const draft = JSON.parse(Buffer.from(raw, "base64url").toString("utf8")) as Record<
        string,
        string
      >;
      const fd = new FormData();
      for (const [key, value] of Object.entries(draft)) fd.append(key, String(value));
      const result = applySettingsGroups(content, String(draft.groups ?? ""), fd);
      if (!("error" in result)) content = result.home;
    } catch {
      // Bozza illeggibile: si mostra la versione salvata.
    }
  }

  const reelItems = await getReelItems(content.hero_slides);
  const customColors = customColorsCss(settings);

  return (
    <>
      {customColors ? <style>{`:root { ${customColors} }`}</style> : null}
      <Header navLinks={content.nav_links} />
      <main className="flex-1">
        <HomeSections settings={settings} content={content} reelItems={reelItems} anchors />
      </main>
      <Footer />
    </>
  );
}

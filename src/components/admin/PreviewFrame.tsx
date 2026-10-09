import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/data/settings";
import { customColorsCss } from "@/lib/siteColors";

/**
 * Cornice delle anteprime in /admin/anteprima: barra che ricorda che è
 * un'anteprima, poi intestazione, contenuto e piè di pagina identici al
 * sito pubblico (colori personalizzati compresi).
 */
export async function PreviewFrame({
  published,
  editHref,
  children,
}: {
  published: boolean;
  editHref: string;
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();
  const customColors = customColorsCss(settings);

  return (
    <>
      {customColors ? <style>{`:root { ${customColors} }`}</style> : null}
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 bg-foreground px-4 py-2 text-center text-sm text-background">
        <span>
          Anteprima —{" "}
          {published ? "pagina pubblicata" : "bozza, non visibile sul sito"}
        </span>
        <a href={editHref} className="underline underline-offset-4">
          Torna a modificare
        </a>
      </div>
      <Header navLinks={settings.home_content.nav_links} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}

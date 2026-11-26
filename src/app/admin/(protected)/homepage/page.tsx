import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { homeText, processSteps } from "@/lib/homeDefaults";
import { isSectionVisible, sectionOrder, VISIBILITY_FIELD } from "@/lib/homeLayout";
import { slugOfSection } from "@/lib/homeSectionsAdmin";
import { PageHeader } from "@/components/admin/settings/PageHeader";
import { HomeLayoutEditor, type LayoutRow } from "@/components/admin/home/HomeLayoutEditor";
import { AdminIcon, type AdminIconName } from "@/components/admin/AdminIcons";
import type { HomeOrderKey } from "@/lib/types";

const ICONS: Record<HomeOrderKey, AdminIconName> = {
  marquee: "band",
  projects: "projects",
  services: "services",
  process: "steps",
  reviews: "star",
  blog: "blog",
  blocks: "layers",
  contact: "chat",
};

const TITLES: Record<HomeOrderKey, string> = {
  marquee: "Banda che scorre",
  projects: "Progetti",
  services: "Servizi",
  process: "Come lavoro",
  reviews: "Recensioni",
  blog: "Dal blog",
  blocks: "Sezioni aggiunte",
  contact: "Contatti",
};

export default async function AdminHomepage() {
  const settings = await getSiteSettings();
  const c = settings.home_content;
  const slides = c.hero_slides?.length ?? 0;
  const visibleReviews = (c.reviews ?? []).filter((r) => r.visible !== false).length;
  const blocks = c.blocks?.length ?? 0;
  const firstLine = c.hero_title_main.split(/\r?\n/).filter(Boolean).join(" ");

  const summaries: Record<HomeOrderKey, string> = {
    marquee: `I nomi dei servizi in movimento: ${c.services.map((s) => s.title).join(", ")}`,
    projects: `Titolo "${homeText(c, "projects_title")}" · i progetti "In evidenza"`,
    services: `${c.services.length} servizi: ${c.services.map((s) => s.title).join(", ")}`,
    process: `${processSteps(c).length} passi: ${processSteps(c).map((s) => s.title).join(", ")}`,
    reviews: `${visibleReviews} ${visibleReviews === 1 ? "recensione visibile" : "recensioni visibili"} · si gestiscono da Recensioni`,
    blog: "Gli ultimi articoli pubblicati",
    blocks: blocks ? `${blocks} ${blocks === 1 ? "sezione" : "sezioni"} libere (testo, galleria, banner)` : "Nessuna: aggiungi testo, galleria o banner con pulsante",
    contact: `Titolo "${homeText(c, "contact_title")}" · modulo di contatto`,
  };

  const hero: LayoutRow = {
    key: "hero",
    href: "/admin/homepage/apertura",
    title: "Apertura",
    summary: `"${firstLine} ${c.hero_title_accent}" · muro con ${slides} copertine · pulsante "${c.cta_primary}"`,
    icon: "slider",
    visible: true,
  };

  const rows: LayoutRow[] = sectionOrder(c).map((key) => ({
    key,
    href: key === "reviews" ? "/admin/recensioni" : `/admin/homepage/${slugOfSection(key)}`,
    title: TITLES[key],
    summary: summaries[key],
    icon: ICONS[key],
    field: VISIBILITY_FIELD[key],
    visible: isSectionVisible(c, key),
    action: key === "reviews" ? "Vai a Recensioni" : undefined,
  }));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        crumb="Aspetto del sito"
        title="Homepage"
        lead="Le sezioni sono nell'ordine in cui appaiono sul sito. Trascinale per spostarle, spegnile per nasconderle, apri Modifica per cambiare testi e immagini con l'anteprima accanto."
        actions={
          <>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center gap-2 border border-border-strong px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              <AdminIcon name="eye" className="h-4 w-4" />
              Vedi la homepage
            </a>
            <Link
              href="/admin/homepage/seo"
              className="inline-flex min-h-11 items-center border border-border-strong px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
            >
              SEO della homepage
            </Link>
          </>
        }
      />
      <HomeLayoutEditor hero={hero} rows={rows} />
    </div>
  );
}

import { Hero } from "@/components/sections/Hero";
import { HeroWall } from "@/components/sections/HeroWall";
import type { ReelItem } from "@/components/sections/HeroReel";
import { Services } from "@/components/sections/Services";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { ContactForm } from "@/components/sections/ContactForm";
import { MarqueeBand } from "@/components/sections/MarqueeBand";
import { Process } from "@/components/sections/Process";
import { Reviews } from "@/components/sections/Reviews";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { homeText, processSteps, sectionTheme } from "@/lib/homeDefaults";
import { isSectionVisible, sectionOrder } from "@/lib/homeLayout";
import type { HomeContent, HomeOrderKey, SiteSettings } from "@/lib/types";

/**
 * Le sezioni della homepage, nell'ordine e con la visibilità scelti in
 * /admin/homepage. Usato dalla homepage vera e dalla sua anteprima dal
 * vivo nell'admin ("anchors" aggiunge un'ancora a ogni sezione, così
 * l'anteprima può mostrare quella che stai modificando).
 */
export function HomeSections({
  settings,
  content: c,
  reelItems,
  anchors = false,
}: {
  settings: SiteSettings;
  content: HomeContent;
  reelItems: ReelItem[];
  anchors?: boolean;
}) {
  const theme = (key: Parameters<typeof sectionTheme>[1]) => sectionTheme(c, key);

  const render: Record<HomeOrderKey, () => React.ReactNode> = {
    marquee: () => <MarqueeBand items={c.services.map((s) => s.title)} theme={theme("marquee")} />,
    projects: () => <ProjectsGrid title={homeText(c, "projects_title")} theme={theme("projects")} />,
    services: () => <Services title={c.services_title} services={c.services} theme={theme("services")} />,
    process: () => (
      <Process
        title={homeText(c, "process_title")}
        subtitle={homeText(c, "process_subtitle")}
        steps={processSteps(c)}
        theme={theme("process")}
      />
    ),
    reviews: () => (
      <Reviews reviews={c.reviews} googleUrl={settings.social_links.google} theme={theme("reviews")} />
    ),
    blog: () => <BlogPreview theme={theme("blog")} />,
    blocks: () => <BlockRenderer blocks={c.blocks} />,
    contact: () => (
      <ContactForm
        theme={theme("contact")}
        eyebrow={homeText(c, "contact_eyebrow")}
        title={homeText(c, "contact_title")}
        text={homeText(c, "contact_text")}
        contactEmail={settings.contact_email}
        contactPhone={settings.contact_phone}
      />
    ),
  };

  const wrap = (key: string, node: React.ReactNode) =>
    anchors ? (
      <div key={key} id={`hs-${key}`} className="scroll-mt-20">
        {node}
      </div>
    ) : (
      <div key={key} className="contents">
        {node}
      </div>
    );

  return (
    <>
      {wrap(
        "hero",
        <Hero
          content={c}
          eyebrow={homeText(c, "hero_eyebrow")}
          theme={theme("hero")}
          stage={reelItems.length > 0 ? <HeroWall items={reelItems} /> : undefined}
        />,
      )}
      {sectionOrder(c)
        .filter((key) => isSectionVisible(c, key))
        .map((key) => wrap(key, render[key]()))}
    </>
  );
}

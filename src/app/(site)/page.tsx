import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { ContactForm } from "@/components/sections/ContactForm";
import { MarqueeBand } from "@/components/sections/MarqueeBand";
import { Process } from "@/components/sections/Process";
import { homeText, processSteps, sectionTheme } from "@/lib/homeDefaults";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { Reviews } from "@/components/sections/Reviews";
import { buildMetadata, personJsonLd, websiteJsonLd } from "@/lib/seo";
import { getPageSeo, getSiteSettings } from "@/lib/data/settings";

export async function generateMetadata(): Promise<Metadata> {
  const [home, settings] = await Promise.all([
    getPageSeo("home"),
    getSiteSettings(),
  ]);

  return buildMetadata({
    title: home?.seo_title || settings.site_title,
    description: home?.seo_description || "",
    path: "/",
    ogImage: home?.seo_og_image,
    noindex: home?.seo_noindex,
  });
}

export default async function HomePage() {
  const settings = await getSiteSettings();
  const c = settings.home_content;
  const theme = (key: Parameters<typeof sectionTheme>[1]) => sectionTheme(c, key);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(settings)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
      />
      <Hero content={c} eyebrow={homeText(c, "hero_eyebrow")} theme={theme("hero")} />
      <MarqueeBand items={c.services.map((s) => s.title)} theme={theme("marquee")} />
      {c.show_projects ?? true ? <ProjectsGrid theme={theme("projects")} /> : null}
      {c.show_services ?? true ? (
        <Services title={c.services_title} services={c.services} theme={theme("services")} />
      ) : null}
      {c.show_process ?? true ? (
        <Process
          title={homeText(c, "process_title")}
          subtitle={homeText(c, "process_subtitle")}
          steps={processSteps(c)}
          theme={theme("process")}
        />
      ) : null}
      {c.show_reviews ?? true ? (
        <Reviews reviews={c.reviews} googleUrl={settings.social_links.google} theme={theme("reviews")} />
      ) : null}
      {c.show_blog_preview ?? true ? <BlogPreview theme={theme("blog")} /> : null}
      <BlockRenderer blocks={c.blocks} />
      {c.show_contact ?? true ? (
        <ContactForm
          theme={theme("contact")}
          eyebrow={homeText(c, "contact_eyebrow")}
          title={homeText(c, "contact_title")}
          text={homeText(c, "contact_text")}
          contactEmail={settings.contact_email}
          contactPhone={settings.contact_phone}
        />
      ) : null}
    </>
  );
}

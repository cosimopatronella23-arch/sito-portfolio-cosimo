import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { ContactForm } from "@/components/sections/ContactForm";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { buildMetadata, personJsonLd } from "@/lib/seo";
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
    siteName: settings.site_title,
  });
}

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personJsonLd(settings)),
        }}
      />
      <Hero content={settings.home_content} />
      {settings.home_content.show_services ?? true ? (
        <Services
          title={settings.home_content.services_title}
          services={settings.home_content.services}
          backgroundColor={settings.home_content.section_colors?.services}
        />
      ) : null}
      {settings.home_content.show_projects ?? true ? (
        <ProjectsGrid
          backgroundColor={settings.home_content.section_colors?.projects}
        />
      ) : null}
      {settings.home_content.show_blog_preview ?? true ? (
        <BlogPreview
          backgroundColor={settings.home_content.section_colors?.blog}
        />
      ) : null}
      <BlockRenderer blocks={settings.home_content.blocks} />
      {settings.home_content.show_contact ?? true ? (
        <ContactForm
          backgroundColor={settings.home_content.section_colors?.contact}
        />
      ) : null}
    </>
  );
}

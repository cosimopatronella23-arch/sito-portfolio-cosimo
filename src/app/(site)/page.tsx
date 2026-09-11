import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { ProjectsGrid } from "@/components/sections/ProjectsGrid";
import { BlogPreview } from "@/components/sections/BlogPreview";
import { ContactForm } from "@/components/sections/ContactForm";
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
        />
      ) : null}
      {settings.home_content.show_projects ?? true ? <ProjectsGrid /> : null}
      {settings.home_content.show_blog_preview ?? true ? (
        <BlogPreview />
      ) : null}
      {settings.home_content.show_contact ?? true ? <ContactForm /> : null}
    </>
  );
}

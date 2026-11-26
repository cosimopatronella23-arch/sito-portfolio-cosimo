import type { Metadata } from "next";
import { getReelItems } from "@/components/sections/HeroReel";
import { HomeSections } from "@/components/home/HomeSections";
import {
  buildMetadata,
  personJsonLd,
  professionalServiceJsonLd,
  websiteJsonLd,
} from "@/lib/seo";
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
  const reelItems = await getReelItems(c.hero_slides);

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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(professionalServiceJsonLd(settings)),
        }}
      />
      <HomeSections settings={settings} content={c} reelItems={reelItems} />
    </>
  );
}

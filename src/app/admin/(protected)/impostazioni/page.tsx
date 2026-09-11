import { getSiteSettings, getPageSeo } from "@/lib/data/settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";

export default async function AdminSettingsPage() {
  const [settings, homeSeo] = await Promise.all([
    getSiteSettings(),
    getPageSeo("home"),
  ]);

  return (
    <div className="flex max-w-3xl flex-col gap-16">
      <div className="flex flex-col gap-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">
          Impostazioni
        </h1>
        <SiteSettingsForm settings={settings} />
      </div>

      <div className="flex flex-col gap-8 border-t border-border pt-10">
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          SEO — Homepage
        </h2>
        <PageSeoForm pageKey="home" seo={homeSeo} />
      </div>
    </div>
  );
}

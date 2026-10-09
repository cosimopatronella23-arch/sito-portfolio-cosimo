import { getSiteSettings, getPageSeo } from "@/lib/data/settings";
import { SiteSettingsForm } from "@/components/admin/SiteSettingsForm";
import { PageSeoForm } from "@/components/admin/PageSeoForm";
import { SettingsTabs, SettingsTabPanel } from "@/components/admin/SettingsTabs";

const TABS = [
  { id: "generale", label: "Generale e colori" },
  { id: "homepage", label: "Homepage" },
  { id: "menu", label: "Menu e footer" },
  { id: "google", label: "Google" },
  { id: "seo", label: "SEO homepage" },
];

export default async function AdminSettingsPage() {
  const [settings, homeSeo] = await Promise.all([
    getSiteSettings(),
    getPageSeo("home"),
  ]);

  return (
    <div className="flex max-w-4xl flex-col gap-8">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Impostazioni
      </h1>
      <SettingsTabs tabs={TABS}>
        <SiteSettingsForm settings={settings} />
        {/* Modulo separato con il suo pulsante: sta fuori da quello delle
            impostazioni, ma si mostra come una scheda. */}
        <SettingsTabPanel tab="seo">
          <PageSeoForm pageKey="home" seo={homeSeo} />
        </SettingsTabPanel>
      </SettingsTabs>
    </div>
  );
}

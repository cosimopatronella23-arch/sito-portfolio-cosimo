import Link from "next/link";
import { getSiteSettings } from "@/lib/data/settings";
import { SettingsTabs, SettingsTabPanel } from "@/components/admin/SettingsTabs";
import { GroupForm } from "@/components/admin/settings/GroupForm";
import { FieldRow, inputClass } from "@/components/admin/settings/FieldRow";
import { PageHeader } from "@/components/admin/settings/PageHeader";

const TABS = [
  { id: "generali", label: "Generali" },
  { id: "contatti", label: "Contatti e social" },
  { id: "google", label: "Google" },
];

const SOCIAL = [
  { key: "instagram", label: "Instagram", help: "Link al profilo. Vuoto = nessuna icona." },
  { key: "linkedin", label: "LinkedIn", help: "Link al profilo. Vuoto = nessuna icona." },
  { key: "dribbble", label: "Dribbble", help: "Link al profilo. Vuoto = nessuna icona." },
  {
    key: "google",
    label: "Scheda Google Business",
    help: 'Compare nel footer come "Recensioni Google" e accanto alle recensioni.',
  },
] as const;

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <PageHeader
        crumb="Sistema"
        title="Impostazioni"
        lead={
          <>
            Solo i dati del sito. Testi e immagini della homepage sono in{" "}
            <Link href="/admin/homepage" className="text-foreground underline underline-offset-4">Homepage</Link>, il menu in{" "}
            <Link href="/admin/menu" className="text-foreground underline underline-offset-4">Menu e footer</Link>, i colori in{" "}
            <Link href="/admin/colori" className="text-foreground underline underline-offset-4">Colori</Link>.
          </>
        }
      />
      <SettingsTabs tabs={TABS}>
        <GroupForm groups={["general", "contacts", "google"]}>
          <SettingsTabPanel tab="generali">
            <FieldRow label="Nome del sito" help="Compare nella scheda del browser e su Google." htmlFor="site_title">
              <input id="site_title" name="site_title" defaultValue={settings.site_title} className={inputClass} />
            </FieldRow>
            <FieldRow label="Partita IVA" help="In fondo a ogni pagina, accanto al nome. 11 cifre." htmlFor="vat_number">
              <input id="vat_number" name="vat_number" defaultValue={settings.home_content.vat_number ?? ""} inputMode="numeric" className={inputClass} />
            </FieldRow>
            <FieldRow label="Immagine per i social" help="Quella che appare quando condividi il sito su WhatsApp o LinkedIn.">
              <Link href="/admin/homepage/seo" className="inline-flex min-h-11 items-center border border-border-strong px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent">
                Si cambia in SEO della homepage
              </Link>
            </FieldRow>
          </SettingsTabPanel>

          <SettingsTabPanel tab="contatti">
            <FieldRow label="Email di contatto" help="Dove arrivano i messaggi del modulo contatti. Compare anche sul sito." htmlFor="contact_email">
              <input id="contact_email" name="contact_email" type="email" defaultValue={settings.contact_email} className={inputClass} />
            </FieldRow>
            <FieldRow label="Telefono" help="Lascia vuoto per non mostrarlo." htmlFor="contact_phone">
              <input id="contact_phone" name="contact_phone" type="tel" defaultValue={settings.contact_phone} className={inputClass} />
            </FieldRow>
            {SOCIAL.map(({ key, label, help }) => (
              <FieldRow key={key} label={label} help={help} htmlFor={`social_${key}`}>
                <input id={`social_${key}`} name={`social_${key}`} type="url" defaultValue={settings.social_links[key] ?? ""} placeholder="https://" className={inputClass} />
              </FieldRow>
            ))}
          </SettingsTabPanel>

          <SettingsTabPanel tab="google">
            <FieldRow label="Google Analytics" help="Il codice che inizia con G-. Vuoto = statistiche spente e nessun banner dei cookie." htmlFor="ga4_measurement_id">
              <input id="ga4_measurement_id" name="ga4_measurement_id" defaultValue={settings.ga4_measurement_id ?? ""} placeholder="G-XXXXXXXXXX" className={inputClass} />
            </FieldRow>
            <FieldRow label="Verifica Search Console" help="Il codice che Google Search Console ti chiede di inserire per confermare che il sito è tuo." htmlFor="google_site_verification_code">
              <input id="google_site_verification_code" name="google_site_verification_code" defaultValue={settings.google_site_verification_code ?? ""} className={inputClass} />
            </FieldRow>
          </SettingsTabPanel>
        </GroupForm>
      </SettingsTabs>
    </div>
  );
}

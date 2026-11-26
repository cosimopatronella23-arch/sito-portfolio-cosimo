import { getSiteSettings } from "@/lib/data/settings";
import { GroupForm } from "@/components/admin/settings/GroupForm";
import { FieldRow, inputClass } from "@/components/admin/settings/FieldRow";
import { PageHeader } from "@/components/admin/settings/PageHeader";
import { NavLinksEditor } from "@/components/admin/NavLinksEditor";

export default async function AdminMenuPage() {
  const settings = await getSiteSettings();
  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <PageHeader
        crumb="Aspetto del sito"
        title="Menu e footer"
        lead="Le voci della barra in alto e il testo in fondo a ogni pagina."
      />
      <GroupForm groups={["menu"]}>
        <FieldRow label="Voci del menu" help="Nell'ordine in cui appaiono. Vuoto = le voci predefinite (Progetti, Servizi, Blog, Contatti).">
          <NavLinksEditor name="nav_links" defaultValue={settings.home_content.nav_links ?? []} />
        </FieldRow>
        <FieldRow label="Testo del footer" help="La frase sotto il tuo nome, in fondo a ogni pagina. Vuoto = testo predefinito." htmlFor="footer_tagline">
          <textarea id="footer_tagline" name="footer_tagline" defaultValue={settings.home_content.footer_tagline ?? ""} rows={3} className={inputClass} />
        </FieldRow>
        <FieldRow label="Partita IVA" help="Compare nel footer, si cambia in Impostazioni > Generali.">
          <p className="pt-2 text-sm text-foreground-muted">{settings.home_content.vat_number ? `P.IVA ${settings.home_content.vat_number}` : "Non inserita"}</p>
        </FieldRow>
      </GroupForm>
    </div>
  );
}

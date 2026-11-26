import Link from "next/link";
import { getAllServicesAdmin } from "@/lib/data/services";
import { deleteService, duplicateService } from "@/lib/actions/services";
import { ContentList } from "@/components/admin/ContentList";
import { AdminIcon } from "@/components/admin/AdminIcons";
import { getSiteSettings } from "@/lib/data/settings";
import { GroupForm } from "@/components/admin/settings/GroupForm";
import { FieldRow, inputClass } from "@/components/admin/settings/FieldRow";

export default async function AdminServicesPage() {
  const [services, settings] = await Promise.all([getAllServicesAdmin(), getSiteSettings()]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            Servizi
          </h1>
          <p className="text-sm text-foreground-muted">
            Le pagine in /servizi. Le bozze non sono visibili al pubblico: usa
            &quot;Anteprima&quot; per vederle come appariranno online.
          </p>
        </div>
        <Link
          href="/admin/servizi/nuovo"
          className="inline-flex min-h-11 items-center gap-2 bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          <AdminIcon name="plus" className="h-4 w-4" />
          Nuovo servizio
        </Link>
      </div>

      <details className="border border-border-strong bg-surface">
        <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-5 text-sm font-semibold">
          Pagina /servizi: titolo e introduzione
          <span className="text-xs font-normal text-foreground-muted">{settings.home_content.services_title}</span>
        </summary>
        <div className="border-t border-border px-5 pb-2">
          <GroupForm groups={["services-page"]} saveLabel="Salva titolo e introduzione">
            <FieldRow label="Titolo" help="Il titolo della pagina /servizi. È anche il titolo della sezione Servizi in homepage." htmlFor="services_title">
              <input id="services_title" name="services_title" defaultValue={settings.home_content.services_title} className={inputClass} />
            </FieldRow>
            <FieldRow label="Introduzione" help="Il testo sotto il titolo." htmlFor="services_intro">
              <textarea id="services_intro" name="services_intro" defaultValue={settings.home_content.services_intro ?? ""} rows={4} className={inputClass} />
            </FieldRow>
          </GroupForm>
        </div>
      </details>

      <ContentList
        reorderTable="service_pages"
        duplicateAction={duplicateService}
        deleteAction={deleteService}
        emptyText="Nessun servizio ancora. Creane uno."
        items={services.map((s) => ({
          id: s.id,
          title: s.title,
          status: s.status,
          thumbnail: s.seo_og_image,
          subtitle: `/servizi/${s.slug}`,
          editHref: `/admin/servizi/${s.id}`,
          previewHref: `/admin/anteprima/servizi/${s.id}`,
          publicHref: `/servizi/${s.slug}`,
        }))}
      />
    </div>
  );
}

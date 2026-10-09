import Link from "next/link";
import { getAllServicesAdmin } from "@/lib/data/services";
import { deleteService, duplicateService } from "@/lib/actions/services";
import { ContentList } from "@/components/admin/ContentList";
import { AdminIcon } from "@/components/admin/AdminIcons";

export default async function AdminServicesPage() {
  const services = await getAllServicesAdmin();

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

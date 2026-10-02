import Link from "next/link";
import { getAllServicesAdmin } from "@/lib/data/services";
import { deleteService, duplicateService } from "@/lib/actions/services";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AdminServicesPage() {
  const services = await getAllServicesAdmin();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between gap-4">
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
          className="shrink-0 bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
        >
          + Nuovo servizio
        </Link>
      </div>

      <div className="flex flex-col">
        {services.length === 0 ? (
          <p className="py-10 text-foreground-muted">
            Nessun servizio ancora. Creane uno.
          </p>
        ) : null}
        {services.map((service) => (
          <div
            key={service.id}
            className="flex flex-wrap items-center justify-between gap-4 border-b border-border py-5 first:border-t"
          >
            <div className="flex items-center gap-4">
              <span
                className={
                  service.status === "published"
                    ? "text-xs text-success"
                    : "text-xs text-warning"
                }
              >
                {service.status === "published" ? "Pubblicato" : "Bozza"}
              </span>
              <span className="font-display text-lg font-semibold">
                {service.title}
              </span>
              <span className="text-xs text-foreground-muted">
                /servizi/{service.slug}
              </span>
            </div>
            <div className="flex items-center gap-5">
              <a
                href={`/admin/anteprima/servizi/${service.id}`}
                target="_blank"
                rel="noopener"
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Anteprima
              </a>
              <Link
                href={`/admin/servizi/${service.id}`}
                className="text-sm text-foreground-muted hover:text-foreground"
              >
                Modifica
              </Link>
              <form action={duplicateService}>
                <input type="hidden" name="id" value={service.id} />
                <button
                  type="submit"
                  className="text-sm text-foreground-muted hover:text-foreground"
                >
                  Duplica
                </button>
              </form>
              <form action={deleteService}>
                <input type="hidden" name="id" value={service.id} />
                <DeleteButton />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Suspense } from "react";
import Link from "next/link";
import { getAllProjectsAdmin } from "@/lib/data/projects";
import { getAllPostsAdmin } from "@/lib/data/blog";
import { getAllServicesAdmin } from "@/lib/data/services";
import { getGA4Summary } from "@/lib/google/analytics";
import { getSearchConsoleSummary } from "@/lib/google/searchConsole";
import { ExportButton } from "@/components/admin/ExportButton";
import { RevalidateButton } from "@/components/admin/RevalidateButton";
import { AdminIcon } from "@/components/admin/AdminIcons";

type Item = {
  type: "Progetto" | "Articolo" | "Servizio";
  title: string;
  status: string;
  updatedAt: string;
  href: string;
};

const relative = new Intl.RelativeTimeFormat("it", { numeric: "auto" });
const longDate = new Intl.DateTimeFormat("it-IT", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

function timeAgo(iso: string) {
  const minutes = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  return relative.format(Math.round(hours / 24), "day");
}

function StatTile({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: string | number;
  detail?: string;
  href?: string;
}) {
  const body = (
    <>
      <span className="text-[0.6875rem] font-medium tracking-[0.1em] text-foreground-muted uppercase sm:text-xs">
        {label}
      </span>
      <span className="font-display text-3xl font-semibold tabular-nums sm:text-4xl">
        {value}
      </span>
      {detail ? (
        <span className="text-sm text-foreground-muted">{detail}</span>
      ) : null}
    </>
  );
  const classes =
    "flex min-w-0 flex-col gap-2 border border-border-strong bg-surface p-4 transition-colors sm:p-5";
  return href ? (
    <Link href={href} className={`${classes} hover:border-accent`}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}

function Panel({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col border border-border-strong bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 className="font-display text-base font-semibold">{title}</h2>
        {action}
      </div>
      <div className="flex flex-col">{children}</div>
    </section>
  );
}

function ItemRow({ item, meta }: { item: Item; meta: string }) {
  return (
    <Link
      href={item.href}
      className="group flex items-center justify-between gap-4 border-b border-border px-5 py-3.5 last:border-b-0 hover:bg-surface-hover"
    >
      <span className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium group-hover:text-accent">
          {item.title}
        </span>
        <span className="text-xs text-foreground-muted">
          {item.type} · {meta}
        </span>
      </span>
      <AdminIcon
        name="arrow"
        className="h-4 w-4 shrink-0 text-foreground-muted group-hover:text-accent"
      />
    </Link>
  );
}

const numberIt = new Intl.NumberFormat("it-IT", { useGrouping: "always" });

async function GoogleStats() {
  const [ga4, gsc] = await Promise.all([
    getGA4Summary(),
    getSearchConsoleSummary(),
  ]);
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatTile
        label="Visitatori"
        value={ga4.ok ? numberIt.format(ga4.data.totalUsers) : "—"}
        detail="ultimi 28 giorni"
        href="/admin/analytics"
      />
      <StatTile
        label="Pagine viste"
        value={ga4.ok ? numberIt.format(ga4.data.pageviews) : "—"}
        detail="ultimi 28 giorni"
        href="/admin/analytics"
      />
      <StatTile
        label="Click da Google"
        value={gsc.ok ? numberIt.format(gsc.data.clicks) : "—"}
        detail="ultimi 28 giorni"
        href="/admin/analytics"
      />
      <StatTile
        label="Apparizioni su Google"
        value={gsc.ok ? numberIt.format(gsc.data.impressions) : "—"}
        detail="ultimi 28 giorni"
        href="/admin/analytics"
      />
    </div>
  );
}

function GoogleStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4" aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-[124px] animate-pulse border border-border-strong bg-surface motion-reduce:animate-none"
        />
      ))}
    </div>
  );
}

const quickActions = [
  { label: "Nuovo progetto", href: "/admin/progetti/nuovo" },
  { label: "Nuovo articolo", href: "/admin/blog/nuovo" },
  { label: "Nuovo servizio", href: "/admin/servizi/nuovo" },
];

export default async function AdminDashboardPage() {
  const [projects, posts, services] = await Promise.all([
    getAllProjectsAdmin(),
    getAllPostsAdmin(),
    getAllServicesAdmin(),
  ]);

  const items: Item[] = [
    ...projects.map((p) => ({
      type: "Progetto" as const,
      title: p.title,
      status: p.status,
      updatedAt: p.updated_at,
      href: `/admin/progetti/${p.id}`,
    })),
    ...posts.map((p) => ({
      type: "Articolo" as const,
      title: p.title,
      status: p.status,
      updatedAt: p.updated_at,
      href: `/admin/blog/${p.id}`,
    })),
    ...services.map((s) => ({
      type: "Servizio" as const,
      title: s.title,
      status: s.status,
      updatedAt: s.updated_at,
      href: `/admin/servizi/${s.id}`,
    })),
  ];

  const drafts = items
    .filter((i) => i.status !== "published")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const recent = [...items]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);
  const published = (list: { status: string }[]) =>
    list.filter((i) => i.status === "published").length;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-sm text-foreground-muted first-letter:uppercase">
            {longDate.format(new Date())}
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Ciao Cosimo.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {quickActions.map((action, i) => (
            <Link
              key={action.href}
              href={action.href}
              className={
                i === 0
                  ? "inline-flex min-h-11 items-center gap-2 bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-accent"
                  : "inline-flex min-h-11 items-center gap-2 border border-border-strong px-4 text-sm transition-colors hover:border-accent hover:text-accent"
              }
            >
              <AdminIcon name="plus" className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatTile
          label="Progetti"
          value={published(projects)}
          detail={`pubblicati su ${projects.length}`}
          href="/admin/progetti"
        />
        <StatTile
          label="Servizi"
          value={published(services)}
          detail={`pubblicati su ${services.length}`}
          href="/admin/servizi"
        />
        <StatTile
          label="Articoli"
          value={published(posts)}
          detail={`pubblicati su ${posts.length}`}
          href="/admin/blog"
        />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <Panel title="Da completare">
          {drafts.length === 0 ? (
            <p className="px-5 py-6 text-sm text-foreground-muted">
              Nessuna bozza in sospeso: è tutto pubblicato.
            </p>
          ) : (
            drafts.map((item) => (
              <ItemRow
                key={item.href}
                item={item}
                meta={`bozza, modificata ${timeAgo(item.updatedAt)}`}
              />
            ))
          )}
        </Panel>
        <Panel title="Ultime modifiche">
          {recent.map((item) => (
            <ItemRow
              key={item.href}
              item={item}
              meta={`${item.status === "published" ? "pubblicato" : "bozza"}, ${timeAgo(item.updatedAt)}`}
            />
          ))}
        </Panel>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-lg font-semibold">
            Il sito su Google
          </h2>
          <Link
            href="/admin/analytics"
            className="text-sm text-foreground-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            Vedi tutti i dati
          </Link>
        </div>
        <Suspense fallback={<GoogleStatsSkeleton />}>
          <GoogleStats />
        </Suspense>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-3 border border-border-strong bg-surface p-5">
          <h2 className="font-display text-base font-semibold">
            Aggiorna il sito online
          </h2>
          <p className="text-sm text-foreground-muted">
            Le pagine si aggiornano da sole dopo ogni salvataggio. Se una
            modifica non compare, forza l&apos;aggiornamento.
          </p>
          <RevalidateButton />
        </div>
        <div className="flex flex-col gap-3 border border-border-strong bg-surface p-5">
          <h2 className="font-display text-base font-semibold">Backup</h2>
          <p className="text-sm text-foreground-muted">
            Ogni lunedì ricevi il backup via email. Da qui puoi scaricarne
            uno aggiornato, bozze comprese.
          </p>
          <ExportButton />
        </div>
      </section>
    </div>
  );
}

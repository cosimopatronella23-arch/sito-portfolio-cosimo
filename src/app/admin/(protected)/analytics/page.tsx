import { getGA4Summary } from "@/lib/google/analytics";
import { getSearchConsoleSummary } from "@/lib/google/searchConsole";
import { BarChart } from "@/components/admin/BarChart";
import { AnalyticsEmptyState } from "@/components/admin/AnalyticsEmptyState";

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "short",
});

function formatGa4Date(raw: string) {
  // GA4 restituisce le date come "20250115"
  if (raw.length !== 8) return raw;
  const date = new Date(
    Number(raw.slice(0, 4)),
    Number(raw.slice(4, 6)) - 1,
    Number(raw.slice(6, 8)),
  );
  return dateFormatter.format(date);
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border border-border-strong p-6">
      <span className="font-display text-3xl font-semibold">{value}</span>
      <span className="text-sm text-foreground-muted">{label}</span>
    </div>
  );
}

export default async function AdminAnalyticsPage() {
  const [ga4, searchConsole] = await Promise.all([
    getGA4Summary(),
    getSearchConsoleSummary(),
  ]);

  return (
    <div className="flex flex-col gap-16">
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Analytics
      </h1>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-xl font-semibold">
          Google Analytics — ultimi 28 giorni
        </h2>

        {ga4.ok ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatTile
                label="Visualizzazioni pagina"
                value={ga4.data.pageviews.toLocaleString("it-IT")}
              />
              <StatTile
                label="Sessioni"
                value={ga4.data.sessions.toLocaleString("it-IT")}
              />
              <StatTile
                label="Utenti"
                value={ga4.data.totalUsers.toLocaleString("it-IT")}
              />
            </div>

            {ga4.data.daily.length > 0 ? (
              <div className="border border-border-strong p-6">
                <p className="mb-6 text-sm text-foreground-muted">
                  Visualizzazioni al giorno
                </p>
                <BarChart
                  data={ga4.data.daily.map((d) => ({
                    label: d.date,
                    value: d.pageviews,
                  }))}
                  formatLabel={formatGa4Date}
                />
              </div>
            ) : null}

            {ga4.data.topPages.length > 0 ? (
              <div className="border border-border-strong p-6">
                <p className="mb-4 text-sm text-foreground-muted">
                  Pagine più visitate
                </p>
                <div className="flex flex-col">
                  {ga4.data.topPages.map((page) => (
                    <div
                      key={page.path}
                      className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                    >
                      <span className="truncate text-sm">{page.path}</span>
                      <span className="shrink-0 text-sm text-foreground-muted">
                        {page.pageviews.toLocaleString("it-IT")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {ga4.data.devices.length > 0 ? (
              <div className="border border-border-strong p-6">
                <p className="mb-4 text-sm text-foreground-muted">
                  Dispositivi (sessioni)
                </p>
                <div className="flex flex-col gap-3">
                  {ga4.data.devices.map((device) => (
                    <div
                      key={device.category}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="capitalize">{device.category}</span>
                      <span className="text-foreground-muted">
                        {device.sessions.toLocaleString("it-IT")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {ga4.data.pageviews === 0 ? (
              <p className="text-sm text-foreground-muted">
                Collegato correttamente, ma ancora nessuna visita registrata —
                normale finché il sito non è online.
              </p>
            ) : null}
          </>
        ) : ga4.reason === "not_configured" ? (
          <AnalyticsEmptyState
            title="Google Analytics non ancora collegato"
            message="Aggiungi il Measurement ID da Impostazioni e le credenziali dell'account di servizio (GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY, GA4_PROPERTY_ID) in .env.local."
          />
        ) : (
          <AnalyticsEmptyState
            title="Non riesco a leggere i dati di Google Analytics"
            message={
              ga4.message ??
              "Controlla che l'account di servizio abbia accesso in lettura alla property GA4."
            }
          />
        )}
      </section>

      <section className="flex flex-col gap-6">
        <h2 className="font-display text-xl font-semibold">
          Google Search Console — ultimi 28 giorni
        </h2>

        {searchConsole.ok ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <StatTile
                label="Click"
                value={searchConsole.data.clicks.toLocaleString("it-IT")}
              />
              <StatTile
                label="Impression"
                value={searchConsole.data.impressions.toLocaleString("it-IT")}
              />
              <StatTile
                label="CTR medio"
                value={`${(searchConsole.data.ctr * 100).toFixed(1)}%`}
              />
              <StatTile
                label="Posizione media"
                value={searchConsole.data.position.toFixed(1)}
              />
            </div>

            {searchConsole.data.topQueries.length > 0 ? (
              <div className="border border-border-strong p-6">
                <p className="mb-4 text-sm text-foreground-muted">
                  Query principali
                </p>
                <div className="flex flex-col">
                  {searchConsole.data.topQueries.map((q) => (
                    <div
                      key={q.query}
                      className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0"
                    >
                      <span className="truncate text-sm">{q.query}</span>
                      <span className="shrink-0 text-sm text-foreground-muted">
                        {q.clicks} click · {q.impressions} impression
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {searchConsole.data.clicks === 0 &&
            searchConsole.data.impressions === 0 ? (
              <p className="text-sm text-foreground-muted">
                Collegato correttamente, ma Google non ha ancora dati per questo
                sito — normale finché non è online e indicizzato.
              </p>
            ) : null}
          </>
        ) : searchConsole.reason === "not_configured" ? (
          <AnalyticsEmptyState
            title="Search Console non ancora collegata"
            message="Verifica la proprietà su Search Console e aggiungi GOOGLE_SEARCH_CONSOLE_SITE_URL in .env.local (oltre alle credenziali già usate per GA4)."
          />
        ) : (
          <AnalyticsEmptyState
            title="Non riesco a leggere i dati di Search Console"
            message={
              searchConsole.message ??
              "Controlla che l'account di servizio sia stato aggiunto come utente della proprietà."
            }
          />
        )}
      </section>
    </div>
  );
}

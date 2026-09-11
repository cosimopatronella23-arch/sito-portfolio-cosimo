import { google } from "googleapis";
import { getGoogleAuth } from "./client";

export interface SearchConsoleSummary {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
  }>;
}

export type SearchConsoleResult =
  | { ok: true; data: SearchConsoleSummary }
  | { ok: false; reason: "not_configured" | "error"; message?: string };

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

/** Dati Search Console degli ultimi 28 giorni. Sola lettura. */
export async function getSearchConsoleSummary(): Promise<SearchConsoleResult> {
  const auth = getGoogleAuth();
  const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

  if (!auth || !siteUrl) {
    return { ok: false, reason: "not_configured" };
  }

  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 28);

  try {
    const searchConsole = google.searchconsole({ version: "v1", auth });

    const [summary, topQueries] = await Promise.all([
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: toDateString(startDate),
          endDate: toDateString(endDate),
        },
      }),
      searchConsole.searchanalytics.query({
        siteUrl,
        requestBody: {
          startDate: toDateString(startDate),
          endDate: toDateString(endDate),
          dimensions: ["query"],
          rowLimit: 5,
        },
      }),
    ]);

    const totals = summary.data.rows?.[0];

    const result: SearchConsoleSummary = {
      clicks: totals?.clicks ?? 0,
      impressions: totals?.impressions ?? 0,
      ctr: totals?.ctr ?? 0,
      position: totals?.position ?? 0,
      topQueries: (topQueries.data.rows ?? []).map((row) => ({
        query: row.keys?.[0] ?? "",
        clicks: row.clicks ?? 0,
        impressions: row.impressions ?? 0,
      })),
    };

    return { ok: true, data: result };
  } catch (error) {
    return {
      ok: false,
      reason: "error",
      message: error instanceof Error ? error.message : "Errore sconosciuto",
    };
  }
}

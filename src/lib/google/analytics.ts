import { google } from "googleapis";
import { getGoogleAuth } from "./client";

export interface GA4Summary {
  totalUsers: number;
  sessions: number;
  pageviews: number;
  daily: Array<{ date: string; pageviews: number }>;
  topPages: Array<{ path: string; pageviews: number }>;
  devices: Array<{ category: string; sessions: number }>;
}

export type GA4Result =
  | { ok: true; data: GA4Summary }
  | { ok: false; reason: "not_configured" | "error"; message?: string };

function numberFromRow(value: string | null | undefined) {
  return Number(value ?? 0) || 0;
}

/** Dati GA4 degli ultimi 28 giorni. Sola lettura. */
export async function getGA4Summary(): Promise<GA4Result> {
  const auth = getGoogleAuth();
  const propertyId = process.env.GA4_PROPERTY_ID;

  if (!auth || !propertyId) {
    return { ok: false, reason: "not_configured" };
  }

  try {
    const analyticsData = google.analyticsdata({ version: "v1beta", auth });
    const property = `properties/${propertyId}`;
    const dateRanges = [{ startDate: "28daysAgo", endDate: "today" }];

    const { data } = await analyticsData.properties.batchRunReports({
      property,
      requestBody: {
        requests: [
          {
            dateRanges,
            metrics: [
              { name: "totalUsers" },
              { name: "sessions" },
              { name: "screenPageViews" },
            ],
          },
          {
            dateRanges,
            dimensions: [{ name: "date" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [{ dimension: { dimensionName: "date" } }],
          },
          {
            dateRanges,
            dimensions: [{ name: "pagePath" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [
              { metric: { metricName: "screenPageViews" }, desc: true },
            ],
            limit: "5",
          },
          {
            dateRanges,
            dimensions: [{ name: "deviceCategory" }],
            metrics: [{ name: "sessions" }],
          },
        ],
      },
    });

    const [summaryReport, dailyReport, topPagesReport, devicesReport] =
      data.reports ?? [];

    const summaryRow = summaryReport?.rows?.[0];

    const result: GA4Summary = {
      totalUsers: numberFromRow(summaryRow?.metricValues?.[0]?.value),
      sessions: numberFromRow(summaryRow?.metricValues?.[1]?.value),
      pageviews: numberFromRow(summaryRow?.metricValues?.[2]?.value),
      daily: (dailyReport?.rows ?? []).map((row) => ({
        date: row.dimensionValues?.[0]?.value ?? "",
        pageviews: numberFromRow(row.metricValues?.[0]?.value),
      })),
      topPages: (topPagesReport?.rows ?? []).map((row) => ({
        path: row.dimensionValues?.[0]?.value ?? "",
        pageviews: numberFromRow(row.metricValues?.[0]?.value),
      })),
      devices: (devicesReport?.rows ?? []).map((row) => ({
        category: row.dimensionValues?.[0]?.value ?? "",
        sessions: numberFromRow(row.metricValues?.[0]?.value),
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

// Controllo automatico del sito (SEO, sicurezza, stabilità, dati Google).
// Uso: node --env-file=.env.local scripts/controllo-giornaliero.mjs
// Stampa un riepilogo JSON e salva lo stato in .controllo-giornaliero.json
// per confrontare con il giorno precedente. Solo letture: non modifica nulla.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import dns from "node:dns/promises";
import tls from "node:tls";
import { google } from "googleapis";

const BASE = "https://cosimopatronella.it";
const DOMAIN_EXPIRY = "2027-09-30";
const STATE_FILE = ".controllo-giornaliero.json";

const problemi = [];
const avvisi = [];
const metriche = {};
const add = (list, msg) => list.push(msg);

async function get(url, opts = {}) {
  try {
    const res = await fetch(url, {
      redirect: opts.redirect ?? "follow",
      headers: { "User-Agent": "controllo-giornaliero" },
      signal: AbortSignal.timeout(30000),
    });
    const text = opts.body === false ? "" : await res.text();
    return { status: res.status, text, headers: res.headers };
  } catch (e) {
    return { status: 0, text: "", headers: new Headers(), error: e.message };
  }
}

const decode = (s) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

// 1. Pagine della sitemap: stato, title, description, canonical, H1, noindex
const sitemap = await get(`${BASE}/sitemap.xml`);
const urls = [...sitemap.text.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
metriche.pagine_sitemap = urls.length;
if (sitemap.status !== 200 || urls.length === 0) {
  add(problemi, `Sitemap non raggiungibile (stato ${sitemap.status})`);
}

const internalLinks = new Set();
const titles = new Map();
for (const url of urls) {
  const r = await get(url);
  const path = url.replace(BASE, "") || "/";
  if (r.status !== 200) {
    add(problemi, `${path} risponde ${r.status}`);
    continue;
  }
  const title = decode(r.text.match(/<title>(.*?)<\/title>/)?.[1] ?? "");
  const desc = decode(
    r.text.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? "",
  );
  const canonical = r.text.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  const h1 = (r.text.match(/<h1[\s>]/g) ?? []).length;
  const robots = r.text.match(/<meta name="robots" content="([^"]+)"/)?.[1];

  if (!title) add(problemi, `${path}: manca il title`);
  else if (title.length > 65) add(avvisi, `${path}: title lungo (${title.length})`);
  if (!desc) add(problemi, `${path}: manca la meta description`);
  else if (desc.length > 160) add(avvisi, `${path}: description lunga (${desc.length})`);
  if (!canonical || canonical.replace(/\/$/, "") !== url.replace(/\/$/, "")) {
    add(problemi, `${path}: canonical errato (${canonical ?? "assente"})`);
  }
  if (h1 !== 1) add(avvisi, `${path}: ${h1} H1 invece di 1`);
  if (robots?.includes("noindex")) add(problemi, `${path}: in sitemap ma noindex`);
  if (title) titles.set(title, [...(titles.get(title) ?? []), path]);

  for (const m of r.text.matchAll(/href="([^"#]+)/g)) {
    const href = decode(m[1]);
    if (href.startsWith("/") && !href.startsWith("//") && !href.startsWith("/_next")) {
      internalLinks.add(BASE + href.split("?")[0]);
    }
  }
}
for (const [t, paths] of titles) {
  if (paths.length > 1) add(avvisi, `Title duplicato "${t}" su ${paths.join(", ")}`);
}

// 2. Link interni rotti
const broken = [];
for (const link of internalLinks) {
  if (urls.includes(link)) continue;
  const r = await get(link, { body: false });
  if (r.status !== 200) broken.push(`${link.replace(BASE, "")} (${r.status})`);
}
metriche.link_interni = internalLinks.size;
if (broken.length) add(problemi, `Link interni rotti: ${broken.join(", ")}`);

// 3. Redirect, 404, admin protetto, health, robots
const redirects = [
  ["http://cosimopatronella.it/", `${BASE}/`],
  ["https://www.cosimopatronella.it/", `${BASE}/`],
  ["https://cosimopatronella.vercel.app/", `${BASE}/`],
];
for (const [from, to] of redirects) {
  const r = await get(from, { redirect: "manual", body: false });
  const loc = r.headers.get("location");
  if (![301, 307, 308].includes(r.status) || loc !== to) {
    add(problemi, `Redirect ${from} non va a ${to} (stato ${r.status}, verso ${loc})`);
  }
}
const notFound = await get(`${BASE}/pagina-che-non-esiste-${Date.now()}`, { body: false });
if (notFound.status !== 404) add(problemi, `Le pagine inesistenti rispondono ${notFound.status} invece di 404`);

const admin = await get(`${BASE}/admin`, { redirect: "manual", body: false });
if (!(admin.status >= 300 && admin.status < 400 && admin.headers.get("location")?.includes("/admin/login"))) {
  add(problemi, `/admin non rimanda al login (stato ${admin.status})`);
}

const health = await get(`${BASE}/api/health`);
if (!health.text.includes("cosimopatronella-site")) add(problemi, "Il controllo di salute /api/health non risponde correttamente");

const robots = await get(`${BASE}/robots.txt`);
if (!robots.text.includes("Disallow: /admin") || !robots.text.includes("Sitemap:")) {
  add(problemi, "robots.txt incompleto");
}

// 4. Intestazioni di sicurezza
const home = await get(`${BASE}/`, { body: false });
for (const h of [
  "strict-transport-security",
  "x-content-type-options",
  "x-frame-options",
  "referrer-policy",
  "permissions-policy",
]) {
  if (!home.headers.get(h)) add(problemi, `Manca l'intestazione di sicurezza ${h}`);
}

// 5. DNS ed email antispoofing
try {
  const a = await dns.resolve4("cosimopatronella.it");
  if (!a.includes("216.198.79.1")) add(problemi, `DNS: record A cambiato (${a.join(", ")})`);
  const txt = (await dns.resolveTxt("cosimopatronella.it")).map((r) => r.join(""));
  if (!txt.some((t) => t.startsWith("v=spf1"))) add(problemi, "DNS: manca il record SPF");
  if (!txt.some((t) => t.startsWith("google-site-verification"))) add(problemi, "DNS: manca la verifica Google");
  const dmarc = (await dns.resolveTxt("_dmarc.cosimopatronella.it")).map((r) => r.join(""));
  if (!dmarc.some((t) => t.includes("p=reject"))) add(problemi, "DNS: DMARC mancante o non in reject");
} catch (e) {
  add(problemi, `DNS non risolvibile: ${e.message}`);
}

// 6. Certificato HTTPS e scadenza dominio
const certDays = await new Promise((resolve) => {
  const socket = tls.connect(443, "cosimopatronella.it", { servername: "cosimopatronella.it" }, () => {
    const cert = socket.getPeerCertificate();
    socket.end();
    resolve(Math.round((new Date(cert.valid_to) - Date.now()) / 864e5));
  });
  socket.on("error", () => resolve(null));
  socket.setTimeout(15000, () => { socket.destroy(); resolve(null); });
});
metriche.certificato_giorni = certDays;
if (certDays === null) add(problemi, "Certificato HTTPS non leggibile");
else if (certDays < 14) add(problemi, `Certificato HTTPS scade tra ${certDays} giorni`);

const domainDays = Math.round((new Date(DOMAIN_EXPIRY) - Date.now()) / 864e5);
metriche.dominio_giorni = domainDays;
if (domainDays < 60) add(avvisi, `Il dominio scade tra ${domainDays} giorni (${DOMAIN_EXPIRY}): decidi se rinnovarlo`);

// 7. Database e registrazioni chiuse
const sb = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const sbHeaders = { apikey: key };
try {
  const r = await fetch(`${sb}/rest/v1/site_settings?select=site_title`, { headers: sbHeaders, signal: AbortSignal.timeout(20000) });
  if (r.status !== 200) add(problemi, `Database Supabase risponde ${r.status}`);
  const s = await (await fetch(`${sb}/auth/v1/settings`, { headers: sbHeaders, signal: AbortSignal.timeout(20000) })).json();
  if (s.disable_signup !== true) add(problemi, "Supabase: le registrazioni di nuovi utenti risultano APERTE");
  // Le bozze non devono essere leggibili dal pubblico
  const drafts = await (await fetch(`${sb}/rest/v1/blog_posts?select=id&status=eq.draft`, { headers: sbHeaders })).json();
  if (Array.isArray(drafts) && drafts.length) add(problemi, "Supabase: bozze leggibili dal pubblico");
} catch (e) {
  add(problemi, `Database Supabase non raggiungibile: ${e.message}`);
}

// 8. Vulnerabilità note nelle dipendenze di produzione
try {
  let out;
  try {
    out = execFileSync("npm", ["audit", "--omit=dev", "--json"], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 120000 });
  } catch (e) {
    out = e.stdout; // npm audit esce con codice 1 se trova vulnerabilità
  }
  const v = JSON.parse(out).metadata?.vulnerabilities ?? {};
  metriche.vulnerabilita = { alte: (v.high ?? 0) + (v.critical ?? 0), medie: v.moderate ?? 0 };
  if (metriche.vulnerabilita.alte) add(problemi, `Dipendenze con vulnerabilità alte/critiche: ${metriche.vulnerabilita.alte}`);
} catch {
  add(avvisi, "npm audit non eseguibile");
}

// 9. Google Search Console e Analytics
const auth = new google.auth.JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  scopes: [
    "https://www.googleapis.com/auth/webmasters.readonly",
    "https://www.googleapis.com/auth/analytics.readonly",
  ],
});
const day = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);

try {
  const sc = google.searchconsole({ version: "v1", auth });
  const site = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL;

  const sm = (await sc.sitemaps.list({ siteUrl: site })).data.sitemap?.[0];
  metriche.sitemap_google = { letta: sm?.lastDownloaded?.slice(0, 10), errori: Number(sm?.errors ?? 0) };
  if (Number(sm?.errors ?? 0) > 0) add(problemi, `Search Console: ${sm.errors} errori nella sitemap`);

  const indicizzate = [];
  const nonIndicizzate = [];
  const nonVerificate = [];
  for (const url of urls) {
    try {
      const r = await sc.urlInspection.index.inspect({
        requestBody: { inspectionUrl: url, siteUrl: site, languageCode: "it-IT" },
      });
      const i = r.data.inspectionResult.indexStatusResult;
      const path = url.replace(BASE, "") || "/";
      if (i.verdict === "PASS") indicizzate.push(path);
      else nonIndicizzate.push(`${path} (${i.coverageState})`);
      if (i.verdict === "FAIL") add(problemi, `Google segnala un errore su ${path}: ${i.coverageState}`);
    } catch {
      // Quota o errore temporaneo di Google: la pagina non è stata
      // controllata oggi, il che NON significa che sia stata tolta.
      nonVerificate.push(url.replace(BASE, "") || "/");
    }
  }
  metriche.indicizzate = indicizzate;
  metriche.non_indicizzate = nonIndicizzate;
  if (nonVerificate.length) {
    metriche.non_verificate_oggi = nonVerificate;
    add(avvisi, `Google non ha risposto per ${nonVerificate.length} pagine: verranno ricontrollate domani`);
  }

  // Ricerca: ultimi 7 giorni disponibili (i dati arrivano con 2-3 giorni di ritardo)
  for (const [label, prop] of [["dominio", site], ["vecchio_vercel", "https://cosimopatronella.vercel.app/"]]) {
    const q = async (start, end) =>
      (await sc.searchanalytics.query({ siteUrl: prop, requestBody: { startDate: start, endDate: end } })).data.rows?.[0] ?? {};
    const now = await q(day(10), day(3));
    const prev = await q(day(17), day(10));
    const top = (await sc.searchanalytics.query({
      siteUrl: prop,
      requestBody: { startDate: day(10), endDate: day(3), dimensions: ["query"], rowLimit: 5 },
    })).data.rows ?? [];
    metriche[`google_${label}`] = {
      click: now.clicks ?? 0,
      impressioni: now.impressions ?? 0,
      posizione: now.position ? Number(now.position.toFixed(1)) : null,
      click_settimana_prima: prev.clicks ?? 0,
      impressioni_settimana_prima: prev.impressions ?? 0,
      ricerche: top.map((r) => `${r.keys[0]} (${r.clicks} click, ${r.impressions} impr., pos. ${r.position.toFixed(1)})`),
    };
  }
} catch (e) {
  add(avvisi, `Search Console non leggibile: ${e.message}`);
}

try {
  const ga = google.analyticsdata({ version: "v1beta", auth });
  const property = `properties/${process.env.GA4_PROPERTY_ID}`;
  const report = async (start, end) =>
    (await ga.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: start, endDate: end }],
        metrics: [{ name: "sessions" }, { name: "activeUsers" }],
      },
    })).data.rows?.[0]?.metricValues?.map((m) => Number(m.value)) ?? [0, 0];
  const [sess, users] = await report("7daysAgo", "yesterday");
  const [sessPrev] = await report("14daysAgo", "8daysAgo");
  const leads = (await ga.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "date" }, { name: "customEvent:method" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "generate_lead" } } },
    },
  })).data.rows ?? [];
  const sources = (await ga.properties.runReport({
    property,
    requestBody: {
      dateRanges: [{ startDate: "7daysAgo", endDate: "yesterday" }],
      dimensions: [{ name: "sessionDefaultChannelGroup" }],
      metrics: [{ name: "sessions" }],
    },
  })).data.rows ?? [];
  metriche.analytics_7gg = {
    visite: sess,
    utenti: users,
    visite_settimana_prima: sessPrev,
    provenienza: Object.fromEntries(sources.map((r) => [r.dimensionValues[0].value, Number(r.metricValues[0].value)])),
    contatti: leads.map((r) => `${r.dimensionValues[0].value} ${r.dimensionValues[1].value}: ${r.metricValues[0].value}`),
  };
} catch (e) {
  add(avvisi, `Analytics non leggibile: ${e.message}`);
}

// 10. Confronto con il controllo precedente
const previous = existsSync(STATE_FILE) ? JSON.parse(readFileSync(STATE_FILE, "utf8")) : null;
const novita = [];
if (previous) {
  const prevIdx = new Set(previous.metriche?.indicizzate ?? []);
  const nuove = (metriche.indicizzate ?? []).filter((p) => !prevIdx.has(p));
  // "Persa" solo se oggi Google ha risposto e la pagina risulta non
  // indicizzata; le pagine non verificate oggi restano nell'elenco.
  const nonVerificateOggi = new Set(metriche.non_verificate_oggi ?? []);
  const perse = [...prevIdx].filter(
    (p) => !(metriche.indicizzate ?? []).includes(p) && !nonVerificateOggi.has(p),
  );
  for (const p of prevIdx) {
    if (nonVerificateOggi.has(p)) metriche.indicizzate?.push(p);
  }
  if (nuove.length) novita.push(`Nuove pagine indicizzate: ${nuove.join(", ")}`);
  if (perse.length) add(problemi, `Pagine non più indicizzate: ${perse.join(", ")}`);
  const prevProblemi = new Set(previous.problemi ?? []);
  const risolti = [...prevProblemi].filter((p) => !problemi.includes(p));
  if (risolti.length) novita.push(`Problemi risolti: ${risolti.join("; ")}`);
}

const result = {
  data: new Date().toISOString(),
  controllo_precedente: previous?.data ?? null,
  problemi,
  avvisi,
  novita,
  metriche,
};
writeFileSync(STATE_FILE, JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));

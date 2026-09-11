# Sito Portfolio — Cosimo Patronella

Portfolio personale custom: Next.js (App Router, TypeScript) + Tailwind CSS +
Supabase (Database/Auth/Storage), online su Vercel.

**Sito live**: https://cosimopatronella.vercel.app

## Stato del progetto

Il sito è online e completo: Supabase come backend, pannello `/admin` per
gestire progetti/articoli/impostazioni, form contatti via Resend, Google
Analytics 4 + Search Console collegati. Vedi la roadmap più sotto per il
dettaglio di cosa è stato fatto in ogni fase.

## Setup Supabase (fatto una volta, per riferimento futuro)

1. **Chiavi API**: da Supabase Studio → *Project Settings → API*, copia
   `Project URL` e `anon public key` in `.env.local` (parti da `.env.example`).
2. **Schema del database**: nell'**SQL Editor** di Supabase Studio, esegui in
   ordine i file in `supabase/migrations/` (0001, 0002, 0003...).
3. **Contenuti di partenza**: esegui anche `supabase/seed.sql` (solo la prima
   volta, su un database vuoto).
4. **Il tuo utente admin**: da Supabase Studio → *Authentication → Add user*,
   crea un utente con l'email e la password che usi per accedere a `/admin`.

## Comandi

```bash
npm install       # installa le dipendenze
npm run dev        # avvia il sito in locale su http://localhost:3100
npm run build       # build di produzione (controlla anche i tipi TypeScript)
npm run start        # avvia la build di produzione in locale
npm run lint           # controllo qualità del codice
```

## Struttura del progetto

```
supabase/
  migrations/                schema database + RLS + bucket immagini (in ordine)
  seed.sql                     contenuti di partenza

src/
  app/
    (site)/                 pagine pubbliche (layout con header/footer/cursore)
      page.tsx                homepage one-page
      progetti/[slug]/        pagina progetto, template fisso
      blog/                   elenco + pagina articolo
    admin/
      login/                  pagina di accesso
      (protected)/             tutto il resto di /admin, protetto da login
    api/cron/keep-alive/     ping giornaliero al database (vedi sotto)
    sitemap.ts, robots.ts     generati dai contenuti pubblicati nel database
  components/
    layout/                  Header, Footer
    ui/                      Button, SectionHeading, CoverImage, ecc.
    sections/                 sezioni della homepage
    project/, blog/            componenti per progetti e articoli
    admin/                      form, editor, upload immagini per /admin
    analytics/                   banner cookie + caricamento GA4
    cursor/                       cursore custom (GSAP)
    motion/                       smooth scroll (Lenis) e transizioni pagina
  lib/
    types.ts                  struttura dati (rispecchia le tabelle Supabase)
    data/                       query di lettura (progetti, blog, impostazioni)
    actions/                     Server Actions per creare/modificare/eliminare
    supabase/                     client Supabase (browser, server, pubblico)
    google/                        GA4 Data API + Search Console API (opzionale)
    seo.ts                        helper per metadati e dati strutturati (JSON-LD)
    fonts.ts                      Sora + Inter (next/font, self-hosted)
src/proxy.ts                    protegge le pagine /admin (richiede login)
vercel.json                      programma il cron giornaliero
```

### Dove intervenire tu (senza toccare il codice)

- **Contenuti progetti/articoli**: tutto da `/admin` (dopo aver fatto login).
- **Colore accento, testi homepage, servizi**: da `/admin/impostazioni`.
- **Colori base e stile**: variabili in `src/app/globals.css` ("Design tokens"
  in cima al file) — questi richiedono una modifica al codice.
- **Dominio definitivo**: quando lo comprerai, aggiungilo da Vercel →
  Settings → Domains, poi aggiorna `SITE_URL` in `src/lib/seo.ts`.

## Perché il sito non "si mette in pausa"

Supabase, sul piano gratuito, mette in pausa i progetti dopo un periodo di
inattività. Un cron job su Vercel (`vercel.json`, gratuito anche questo)
chiama `/api/cron/keep-alive` una volta al giorno per tenere il database
attivo — non richiede nessuna azione da parte tua. La route è protetta dalla
variabile `CRON_SECRET` (Vercel la invia automaticamente nell'header di
autorizzazione quando esegue il cron).

## Roadmap

1. ✅ **Fase 1** — Scaffold, design system, pagine pubbliche.
2. ✅ **Fase 2** — Supabase (DB/Auth/Storage), admin `/admin` con CRUD
   progetti/blog, editor rich text (Tiptap), upload immagini.
3. ✅ **Fase 3** — Form contatti collegato a Resend, editor SEO homepage in
   admin, sitemap/robots dinamici da Supabase.
4. ✅ **Fase 4** — Google Analytics 4 + Search Console collegati al sito
   (banner cookie GDPR incluso). Dashboard dati *dentro* `/admin` non
   implementata per scelta (i dati si consultano su analytics.google.com e
   search.google.com/search-console) — il codice in `src/lib/google/` è
   comunque pronto se in futuro si vorrà completarla.
5. ✅ **Fase 5** — Deploy su Vercel, ottimizzazione performance (pagine
   pubbliche statiche/ISR), cron keep-alive per Supabase.

## Stack

- **Frontend/backend**: Next.js 16 (App Router, TypeScript)
- **Database/Auth/Storage**: Supabase (Postgres), Server Actions per le
  mutazioni, Row Level Security per i permessi (nessuna service role key nel
  codice)
- **Editor rich text**: Tiptap
- **Styling**: Tailwind CSS v4 (design tokens in `globals.css`)
- **Animazioni**: Framer Motion, GSAP (cursore custom), Lenis (smooth scroll)
- **Font**: Sora (titoli) + Inter (testo), entrambi open-source via Google
  Fonts, self-hosted automaticamente da Next.js
- **Hosting**: Vercel (piano gratuito), deploy automatico ad ogni push su
  `main` del repository GitHub

## Deploy

Il repository è collegato a Vercel: ogni push sul branch `main` ripubblica il
sito in automatico in 1-2 minuti. Le variabili d'ambiente vanno impostate una
volta sola in Vercel → Settings → Environment Variables (stessi nomi di
`.env.example`).

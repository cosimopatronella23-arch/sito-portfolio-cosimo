# Sito Portfolio — Cosimo Patronella

Portfolio personale custom: Next.js (App Router, TypeScript) + Tailwind CSS +
Supabase (Database/Auth/Storage), deploy su Vercel.

## Stato del progetto

Siamo in **Fase 2**: il sito legge da un database Supabase reale e c'è un
pannello `/admin` per gestire progetti, articoli e SEO senza toccare il
codice. Vedi la roadmap completa più sotto.

## Setup Supabase (da fare una volta sola)

1. **Chiavi API**: da Supabase Studio → *Project Settings → API*, copia
   `Project URL` e `anon public key`. Crea un file `.env.local` nella
   cartella del progetto (parti da `.env.example`) e incollale lì:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```
2. **Schema del database**: apri l'**SQL Editor** in Supabase Studio, incolla
   il contenuto di `supabase/migrations/0001_init.sql` ed esegui. Crea le
   tabelle, le regole di accesso (RLS) e il bucket per le immagini.
3. **Contenuti di partenza**: sempre nell'SQL Editor, incolla ed esegui
   `supabase/seed.sql` — inserisce gli stessi progetti/articoli di esempio
   che vedevi prima, così parti da un sito già popolato.
4. **Il tuo utente admin**: da Supabase Studio → *Authentication → Add user*,
   crea un utente con l'email e la password che vuoi usare per accedere a
   `/admin` (niente registrazione pubblica, è tutto tuo).

Fatto questo, `npm run dev` e il sito legge/scrive dal tuo Supabase.

## Comandi

```bash
npm install       # installa le dipendenze (già fatto)
npm run dev        # avvia il sito in locale su http://localhost:3000
npm run build       # build di produzione (controlla anche i tipi TypeScript)
npm run start        # avvia la build di produzione in locale
npm run lint           # controllo qualità del codice
```

## Struttura del progetto

```
supabase/
  migrations/0001_init.sql   schema database + RLS + bucket immagini
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
    sitemap.ts, robots.ts     generati dai contenuti pubblicati nel database
  components/
    layout/                  Header, Footer
    ui/                      Button, SectionHeading, CoverImage, ecc.
    sections/                 sezioni della homepage
    project/, blog/            componenti per progetti e articoli
    admin/                      form, editor, upload immagini per /admin
    cursor/                      cursore custom (GSAP)
    motion/                      smooth scroll (Lenis) e transizioni pagina
  lib/
    types.ts                  struttura dati (rispecchia le tabelle Supabase)
    data/                       query di lettura (progetti, blog, impostazioni)
    actions/                     Server Actions per creare/modificare/eliminare
    supabase/                     client Supabase (browser + server)
    seo.ts                        helper per metadati e dati strutturati (JSON-LD)
    fonts.ts                      Sora + Inter (next/font, self-hosted)
src/proxy.ts                    protegge le pagine /admin (richiede login)
```

### Dove intervenire tu (senza toccare il codice)

- **Contenuti progetti/articoli**: tutto da `/admin` (dopo aver fatto login).
- **Colori e stile**: tutti i colori sono definiti come variabili in
  `src/app/globals.css` (sezione "Design tokens" in cima al file).
- **Nome sito, email, social, SEO homepage**: da `/admin/impostazioni`.
- **Dominio definitivo**: `SITE_URL` in `src/lib/seo.ts` (da aggiornare prima
  del deploy in produzione).

## Roadmap

1. ✅ **Fase 1** — Scaffold, design system, pagine pubbliche.
2. ✅ **Fase 2** — Supabase (DB/Auth/Storage), admin `/admin` con CRUD
   progetti/blog, editor rich text (Tiptap), upload immagini.
3. ✅ **Fase 3** — Form contatti collegato a Resend, editor SEO homepage in
   admin, sitemap/robots dinamici da Supabase.
4. ⏳ **Fase 4** — Dashboard analytics in admin con dati da Google Analytics 4
   e Google Search Console.
5. ⏳ **Fase 5** — Deploy su Vercel e QA finale.

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

## Deploy (quando saremo alla Fase 5)

Il modo più semplice è collegare il repository a [Vercel](https://vercel.com/new)
(piano gratuito): rileva automaticamente Next.js. Ricordati di impostare le
stesse variabili di `.env.local` (URL e anon key di Supabase) nelle
Environment Variables del progetto Vercel.

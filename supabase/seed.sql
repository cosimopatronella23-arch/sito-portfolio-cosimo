-- Contenuti di partenza (gli stessi che vedevi nei dati di esempio).
-- Incolla ed esegui DOPO 0001_init.sql, sempre nell'SQL Editor di Supabase Studio.
-- Da /admin potrai poi modificarli o cancellarli liberamente.

insert into site_settings (id, site_title, favicon, social_links, ga4_measurement_id, google_site_verification_code, contact_email)
values (
  'main',
  'Cosimo Patronella — Web Designer',
  '/favicon.svg',
  '{"instagram": "https://instagram.com/", "linkedin": "https://linkedin.com/", "dribbble": "https://dribbble.com/"}'::jsonb,
  null,
  null,
  'cosimopatronella23@gmail.com'
)
on conflict (id) do nothing;

insert into page_seo (page_key, seo_title, seo_description, seo_og_image, seo_noindex)
values (
  'home',
  'Cosimo Patronella — Web Designer & Sviluppatore Frontend',
  'Portfolio di Cosimo Patronella: siti e prodotti digitali su misura, design premium e sviluppo frontend moderno.',
  null,
  false
)
on conflict (page_key) do nothing;

insert into projects (slug, title, category, client, year, cover_image, gallery, short_description, content_blocks, external_link, featured, status, created_at, updated_at)
values
(
  'aria-studio-fotografico',
  'Aria — Studio Fotografico',
  'Sito vetrina',
  'Aria Studio',
  2025,
  null,
  '{}',
  'Sito vetrina minimale per uno studio fotografico, pensato per portfolio scorrevoli e caricamento immediato.',
  '[
    {"heading": "Il problema", "body": "Lo studio aveva un sito datato, lento su mobile e con un portfolio difficile da aggiornare autonomamente."},
    {"heading": "La soluzione", "body": "Nuovo sito one-page con griglia fotografica ottimizzata, caricamento progressivo delle immagini e un piccolo pannello per aggiornare i progetti senza toccare il codice."},
    {"heading": "Risultati", "body": "Tempo di caricamento dimezzato e aumento delle richieste di preventivo dal form contatti."}
  ]'::jsonb,
  null, true, 'published', '2025-01-10T09:00:00Z', '2025-01-20T09:00:00Z'
),
(
  'nova-fintech-dashboard',
  'Nova — Dashboard Fintech',
  'Prodotto digitale',
  'Nova Finance',
  2025,
  null,
  '{}',
  'Design system e interfaccia per una dashboard di gestione investimenti, focus su chiarezza dei dati.',
  '[
    {"heading": "Il problema", "body": "L''interfaccia esistente sovraccaricava l''utente di numeri senza gerarchia visiva chiara."},
    {"heading": "La soluzione", "body": "Design system component-based con tipografia numerica dedicata, grafici semplificati e stati vuoti curati."},
    {"heading": "Risultati", "body": "Riduzione del tempo medio per completare un''operazione e feedback positivo nei test utente."}
  ]'::jsonb,
  null, true, 'published', '2025-02-05T09:00:00Z', '2025-02-15T09:00:00Z'
),
(
  'lumen-agenzia-eventi',
  'Lumen — Agenzia Eventi',
  'Sito + booking',
  'Lumen Events',
  2024,
  null,
  '{}',
  'Sito con sistema di richiesta preventivo integrato per un''agenzia di organizzazione eventi.',
  '[
    {"heading": "Il problema", "body": "Le richieste arrivavano solo via email, senza un modo per qualificare rapidamente i lead."},
    {"heading": "La soluzione", "body": "Form multi-step con logica condizionale in base al tipo di evento, collegato a email transazionali automatiche."},
    {"heading": "Risultati", "body": "Lead più qualificati e tempo di risposta ridotto da giorni a ore."}
  ]'::jsonb,
  null, false, 'published', '2024-11-12T09:00:00Z', '2024-11-20T09:00:00Z'
),
(
  'orbit-app-mobile',
  'Orbit — App Mobile',
  'UI/UX Mobile',
  'Orbit Labs',
  2024,
  null,
  '{}',
  'UI kit e prototipo ad alta fedeltà per un''app di produttività personale.',
  '[
    {"heading": "Il problema", "body": "Il primo prototipo aveva una curva di apprendimento troppo ripida per i nuovi utenti."},
    {"heading": "La soluzione", "body": "Onboarding progressivo, componenti riutilizzabili e micro-interazioni per guidare l''utente passo dopo passo."},
    {"heading": "Risultati", "body": "Tasso di completamento dell''onboarding aumentato nei test con utenti reali."}
  ]'::jsonb,
  null, false, 'published', '2024-08-01T09:00:00Z', '2024-08-10T09:00:00Z'
)
on conflict (slug) do nothing;

insert into blog_posts (slug, title, category, cover_image, excerpt, content, status, published_at, created_at, updated_at)
values
(
  'perche-un-sito-custom-conviene',
  'Perché un sito custom conviene (quasi) sempre',
  'Strategia',
  null,
  'WordPress non è sempre la scelta giusta: quando un sito su misura fa risparmiare tempo e soldi nel medio periodo.',
  '<p>Un sito costruito su misura elimina plugin superflui, riduce la superficie d''attacco per la sicurezza e resta veloce anche dopo anni. Non è la scelta giusta per tutti i budget, ma per chi ha bisogno di controllo totale su performance e SEO è quasi sempre la strada migliore nel medio periodo.</p>',
  'published', '2025-03-01T09:00:00Z', '2025-03-01T09:00:00Z', '2025-03-01T09:00:00Z'
),
(
  'core-web-vitals-guida-pratica',
  'Core Web Vitals: guida pratica senza tecnicismi',
  'Performance',
  null,
  'Cosa sono LCP, INP e CLS in parole semplici, e tre interventi ad alto impatto per migliorarli subito.',
  '<p>I Core Web Vitals misurano la velocità di caricamento, la reattività alle interazioni e la stabilità visiva di una pagina. Ottimizzare le immagini, ridurre il JavaScript non necessario e riservare lo spazio per gli elementi che si caricano dopo sono i tre interventi con il rapporto sforzo/risultato migliore.</p>',
  'published', '2025-02-10T09:00:00Z', '2025-02-10T09:00:00Z', '2025-02-10T09:00:00Z'
),
(
  'design-system-piccoli-progetti',
  'Serve un design system anche per i progetti piccoli?',
  'Design',
  null,
  'Non serve un kit enorme: bastano pochi token ben scelti per rendere qualsiasi progetto più coerente e veloce da costruire.',
  '<p>Anche un progetto di poche pagine beneficia di un set minimo di token: colori, tipografia, spaziature e raggio dei bordi. Definirli prima di iniziare a disegnare le schermate evita incoerenze e velocizza ogni decisione successiva.</p>',
  'published', '2025-01-15T09:00:00Z', '2025-01-15T09:00:00Z', '2025-01-15T09:00:00Z'
)
on conflict (slug) do nothing;

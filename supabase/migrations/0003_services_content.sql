-- Aggiunge la lista dei servizi (sezione "Quello che so fare bene") ai
-- contenuti modificabili della homepage.
-- Incolla nell'SQL Editor di Supabase Studio ed esegui (dopo 0002).

-- Riempie la riga esistente solo se non ha già la chiave "services"
update site_settings
set home_content = home_content || jsonb_build_object(
  'services', jsonb_build_array(
    jsonb_build_object(
      'title', 'Web Design',
      'description', 'Zero temi pronti: gerarchia, font e colori su misura.'
    ),
    jsonb_build_object(
      'title', 'Sviluppo Frontend',
      'description', 'Codice pulito e veloce, senza librerie di troppo.'
    ),
    jsonb_build_object(
      'title', 'SEO Tecnica',
      'description', 'Bello ma introvabile su Google? Ci penso da subito.'
    ),
    jsonb_build_object(
      'title', 'Design System',
      'description', 'Regole chiare, coerenza anche tra un anno.'
    )
  )
)
where id = 'main' and not (home_content ? 'services');

-- Aggiorna il valore di default della colonna per eventuali nuove installazioni
alter table site_settings
  alter column home_content set default '{
    "hero_title_main": "Siti fatti bene,\nnon ",
    "hero_title_accent": "sfornati in serie.",
    "hero_subtitle": "Sono Cosimo, web designer. Niente template, niente scorciatoie.",
    "hero_quote": "\"A cosa deve servire davvero questo sito?\" — me lo chiedo prima di ogni schizzo.",
    "cta_primary": "Parliamo del tuo progetto",
    "cta_secondary": "Guarda i progetti",
    "services_title": "Quello che so fare bene.",
    "services": [
      {"title": "Web Design", "description": "Zero temi pronti: gerarchia, font e colori su misura."},
      {"title": "Sviluppo Frontend", "description": "Codice pulito e veloce, senza librerie di troppo."},
      {"title": "SEO Tecnica", "description": "Bello ma introvabile su Google? Ci penso da subito."},
      {"title": "Design System", "description": "Regole chiare, coerenza anche tra un anno."}
    ]
  }'::jsonb;

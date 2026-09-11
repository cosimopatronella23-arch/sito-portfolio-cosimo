-- Aggiunge alle impostazioni del sito: colore accento e testi della homepage,
-- così sono modificabili da /admin/impostazioni senza toccare il codice.
-- Incolla nell'SQL Editor di Supabase Studio ed esegui (dopo 0001_init.sql).

alter table site_settings
  add column if not exists accent_color text not null default '#a78bfa';

alter table site_settings
  add column if not exists home_content jsonb not null default '{
    "hero_title_main": "Siti fatti bene,\nnon ",
    "hero_title_accent": "sfornati in serie.",
    "hero_subtitle": "Sono Cosimo, web designer. Niente template, niente scorciatoie.",
    "hero_quote": "\"A cosa deve servire davvero questo sito?\" — me lo chiedo prima di ogni schizzo.",
    "cta_primary": "Parliamo del tuo progetto",
    "cta_secondary": "Guarda i progetti",
    "services_title": "Quello che so fare bene."
  }'::jsonb;

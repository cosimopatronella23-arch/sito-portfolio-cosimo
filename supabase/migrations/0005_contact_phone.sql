-- Aggiunge il numero di telefono ai contatti del sito, modificabile da
-- /admin/impostazioni come l'email. Incolla nell'SQL Editor di Supabase
-- Studio ed esegui una volta.

alter table site_settings
  add column contact_phone text not null default '';

update site_settings
  set contact_phone = '3920824301'
  where id = 'main';

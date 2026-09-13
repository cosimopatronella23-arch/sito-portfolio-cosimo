-- Permette di scegliere, per ogni foto/video della galleria di un progetto,
-- se mostrarla a tutta larghezza o affiancata a un'altra. Prima la galleria
-- era un semplice elenco di link (text[]); ora diventa un elenco di oggetti
-- {"url": "...", "layout": "full" | "half"} (jsonb).
-- Incolla nell'SQL Editor di Supabase Studio ed esegui una volta.

-- Postgres non permette una sottoquery diretta nella conversione di tipo
-- (ALTER COLUMN ... USING), quindi passiamo da una funzione di appoggio,
-- che poi viene eliminata.
create or replace function _gallery_to_jsonb(g text[]) returns jsonb as $$
  select coalesce(
    jsonb_agg(jsonb_build_object('url', item, 'layout', 'full')),
    '[]'::jsonb
  )
  from unnest(g) as item;
$$ language sql immutable;

-- Va tolto il valore predefinito vecchio prima di cambiare tipo: Postgres
-- proverebbe a convertirlo automaticamente e fallirebbe (è un array di
-- testo, non compatibile con jsonb).
alter table projects
  alter column gallery drop default;

alter table projects
  alter column gallery type jsonb
  using _gallery_to_jsonb(gallery);

alter table projects
  alter column gallery set default '[]'::jsonb;

drop function _gallery_to_jsonb(text[]);

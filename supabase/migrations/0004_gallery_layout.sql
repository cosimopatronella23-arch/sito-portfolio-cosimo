-- Permette di scegliere, per ogni foto/video della galleria di un progetto,
-- se mostrarla a tutta larghezza o affiancata a un'altra. Prima la galleria
-- era un semplice elenco di link (text[]); ora diventa un elenco di oggetti
-- {"url": "...", "layout": "full" | "half"} (jsonb).
-- Incolla nell'SQL Editor di Supabase Studio ed esegui una volta.

alter table projects
  alter column gallery type jsonb
  using (
    coalesce(
      (
        select jsonb_agg(jsonb_build_object('url', g, 'layout', 'full'))
        from unnest(gallery) as g
      ),
      '[]'::jsonb
    )
  );

alter table projects
  alter column gallery set default '[]'::jsonb;

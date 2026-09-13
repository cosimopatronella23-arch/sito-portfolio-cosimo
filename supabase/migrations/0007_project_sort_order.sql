-- Permette di scegliere manualmente l'ordine di comparsa dei progetti (in
-- homepage e in /progetti), invece del solo ordine di creazione/evidenza.
-- Incolla nell'SQL Editor di Supabase Studio ed esegui una volta.

alter table projects
  add column sort_order integer not null default 0;

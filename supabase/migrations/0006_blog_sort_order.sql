-- Permette di scegliere manualmente l'ordine di comparsa degli articoli
-- (in homepage e in /blog), invece del solo ordine di pubblicazione.
-- Incolla nell'SQL Editor di Supabase Studio ed esegui una volta.

alter table blog_posts
  add column sort_order integer not null default 0;

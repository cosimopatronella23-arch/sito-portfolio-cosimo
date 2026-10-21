-- Autorizzazioni esplicite per le API di Supabase (supabase-js).
--
-- Dal 30 ottobre 2026 Supabase non concede più in automatico l'accesso
-- alle tabelle NUOVE create nello schema "public": senza un GRANT le API
-- rispondono "permission denied". Le tabelle già esistenti mantengono le
-- autorizzazioni attuali, quindi sul database in uso oggi questo file non
-- cambia nulla (aggiunge solo ciò che c'è già). Serve se il database viene
-- ricreato da zero eseguendo le migrazioni in ordine.
--
-- La sicurezza resta affidata alle regole RLS di ogni tabella (vedi 0001,
-- 0008, 0009, 0010): "anon" può solo leggere ciò che le regole mostrano al
-- pubblico, "authenticated" passa comunque dal controllo public.is_admin().
--
-- REGOLA PER LE PROSSIME MIGRAZIONI: ogni "create table" in public va
-- seguita dai suoi GRANT nello stesso file, come qui sotto.

grant usage on schema public to anon, authenticated, service_role;

grant select on
  public.projects,
  public.blog_posts,
  public.site_settings,
  public.page_seo,
  public.service_pages,
  public.content_trash,
  public.content_revisions
to anon;

grant select, insert, update, delete on
  public.projects,
  public.blog_posts,
  public.site_settings,
  public.page_seo,
  public.service_pages,
  public.content_trash,
  public.content_revisions
to authenticated, service_role;

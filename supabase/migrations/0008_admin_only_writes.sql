-- =====================================================================
-- 0008 — Scrittura riservata al solo account admin + limiti allo storage
--
-- PRIMA DI ESEGUIRE: verifica che l'email qui sotto (in is_admin()) sia
-- esattamente quella con cui accedi a /admin. Se è diversa, sostituiscila:
-- altrimenti non potrai più salvare nulla dall'admin (si risolve
-- rieseguendo lo script con l'email giusta).
--
-- Perché: prima ogni utente "autenticato" poteva modificare tutto. Con la
-- registrazione pubblica attiva su Supabase, chiunque poteva crearsi un
-- account e ottenere pieno accesso. Anche dopo aver disattivato la
-- registrazione, questa migrazione garantisce che basti un solo account.
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'cosimopatronella23@gmail.com';
$$;

-- PROGETTI
drop policy if exists "progetti gestiti da utenti autenticati" on projects;
create policy "progetti gestiti dall'admin"
  on projects for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ARTICOLI
drop policy if exists "articoli gestiti da utenti autenticati" on blog_posts;
create policy "articoli gestiti dall'admin"
  on blog_posts for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- IMPOSTAZIONI SITO
drop policy if exists "impostazioni gestite da utenti autenticati" on site_settings;
create policy "impostazioni gestite dall'admin"
  on site_settings for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- SEO PAGINE
drop policy if exists "seo pagine gestite da utenti autenticati" on page_seo;
create policy "seo pagine gestite dall'admin"
  on page_seo for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- STORAGE: upload/modifica/eliminazione solo dall'admin
drop policy if exists "upload immagini da utenti autenticati" on storage.objects;
create policy "upload media dall'admin"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "modifica immagini da utenti autenticati" on storage.objects;
create policy "modifica media dall'admin"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

drop policy if exists "eliminazione immagini da utenti autenticati" on storage.objects;
create policy "eliminazione media dall'admin"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- STORAGE: solo immagini e video, massimo 50 MB per file. Niente SVG: può
-- contenere script eseguibili se aperto direttamente dal suo URL pubblico.
update storage.buckets
set
  allowed_mime_types = array[
    'image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif',
    'image/x-icon', 'image/vnd.microsoft.icon',
    'video/mp4', 'video/webm'
  ],
  file_size_limit = 52428800
where id = 'media';

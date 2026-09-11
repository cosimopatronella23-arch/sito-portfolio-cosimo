-- Schema iniziale per il sito portfolio di Cosimo Patronella.
-- Incolla questo file nell'SQL Editor di Supabase Studio ed esegui una volta.

-- Funzione condivisa per aggiornare updated_at automaticamente
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ---------------------------------------------------------------------
-- PROGETTI
-- ---------------------------------------------------------------------
create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default '',
  client text not null default '',
  year int not null default extract(year from now()),
  cover_image text,
  gallery text[] not null default '{}',
  short_description text not null default '',
  content_blocks jsonb not null default '[]',
  external_link text,
  featured boolean not null default false,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  seo_og_image text,
  seo_noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

alter table projects enable row level security;

create policy "projects pubblici in lettura"
  on projects for select
  to anon, authenticated
  using (status = 'published');

create policy "progetti gestiti da utenti autenticati"
  on projects for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- ARTICOLI BLOG
-- ---------------------------------------------------------------------
create table blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  category text not null default '',
  cover_image text,
  excerpt text not null default '',
  content text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz not null default now(),
  seo_title text,
  seo_description text,
  seo_og_image text,
  seo_noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger blog_posts_set_updated_at
  before update on blog_posts
  for each row execute function set_updated_at();

alter table blog_posts enable row level security;

create policy "articoli pubblici in lettura"
  on blog_posts for select
  to anon, authenticated
  using (status = 'published');

create policy "articoli gestiti da utenti autenticati"
  on blog_posts for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- IMPOSTAZIONI SITO (un'unica riga)
-- ---------------------------------------------------------------------
create table site_settings (
  id text primary key default 'main' check (id = 'main'),
  site_title text not null default 'Cosimo Patronella — Web Designer',
  favicon text,
  social_links jsonb not null default '{}',
  ga4_measurement_id text,
  google_site_verification_code text,
  contact_email text not null default ''
);

alter table site_settings enable row level security;

create policy "impostazioni pubbliche in lettura"
  on site_settings for select
  to anon, authenticated
  using (true);

create policy "impostazioni gestite da utenti autenticati"
  on site_settings for update
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- SEO PAGINE STATICHE
-- ---------------------------------------------------------------------
create table page_seo (
  page_key text primary key check (page_key in ('home', 'servizi', 'contatti')),
  seo_title text not null default '',
  seo_description text not null default '',
  seo_og_image text,
  seo_noindex boolean not null default false
);

alter table page_seo enable row level security;

create policy "seo pagine pubbliche in lettura"
  on page_seo for select
  to anon, authenticated
  using (true);

create policy "seo pagine gestite da utenti autenticati"
  on page_seo for all
  to authenticated
  using (true)
  with check (true);

-- ---------------------------------------------------------------------
-- STORAGE: bucket pubblico per le immagini caricate da /admin
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "immagini media pubbliche in lettura"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

create policy "upload immagini da utenti autenticati"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media');

create policy "modifica immagini da utenti autenticati"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media');

create policy "eliminazione immagini da utenti autenticati"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media');

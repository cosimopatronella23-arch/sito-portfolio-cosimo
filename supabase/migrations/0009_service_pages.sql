-- =====================================================================
-- 0009 — Pagine dei servizi (/servizi/[slug]), modificabili da /admin.
-- Stesse regole di progetti e articoli: il pubblico legge solo le pagine
-- pubblicate, solo l'account admin (public.is_admin(), migrazione 0008)
-- può creare, modificare o eliminare.
-- =====================================================================

create table if not exists service_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null default '',
  intro text not null default '',
  content_blocks jsonb not null default '[]'::jsonb,
  faqs jsonb not null default '[]'::jsonb,
  related_project_slugs jsonb not null default '[]'::jsonb,
  area_served text not null default '',
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  seo_title text,
  seo_description text,
  seo_og_image text,
  seo_noindex boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists service_pages_set_updated_at on service_pages;
create trigger service_pages_set_updated_at
  before update on service_pages
  for each row execute function set_updated_at();

alter table service_pages enable row level security;

drop policy if exists "servizi pubblici in lettura" on service_pages;
create policy "servizi pubblici in lettura"
  on service_pages for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists "servizi gestiti dall'admin" on service_pages;
create policy "servizi gestiti dall'admin"
  on service_pages for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

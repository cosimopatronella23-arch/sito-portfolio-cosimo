-- Cestino e cronologia delle versioni per progetti, articoli e servizi.
-- Solo tabelle nuove: nessuna tabella esistente viene modificata.
-- Visibili e modificabili solo dall'amministratore (public.is_admin()).

create table if not exists content_trash (
  id uuid primary key default gen_random_uuid(),
  table_name text not null
    check (table_name in ('projects', 'blog_posts', 'service_pages')),
  record_id uuid not null,
  title text not null default '',
  data jsonb not null,
  deleted_at timestamptz not null default now()
);

create index if not exists content_trash_deleted_at_idx
  on content_trash (deleted_at desc);

alter table content_trash enable row level security;

drop policy if exists "cestino solo admin" on content_trash;
create policy "cestino solo admin" on content_trash
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create table if not exists content_revisions (
  id uuid primary key default gen_random_uuid(),
  table_name text not null
    check (table_name in ('projects', 'blog_posts', 'service_pages')),
  record_id uuid not null,
  data jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists content_revisions_record_idx
  on content_revisions (table_name, record_id, created_at desc);

alter table content_revisions enable row level security;

drop policy if exists "versioni solo admin" on content_revisions;
create policy "versioni solo admin" on content_revisions
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

select 'ok' as esito;

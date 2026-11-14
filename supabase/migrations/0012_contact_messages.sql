-- Messaggi del modulo contatti salvati nel database, oltre all'email di
-- avviso: se l'email non arriva (spam, servizio di invio fermo) il
-- messaggio resta comunque nella sezione "Messaggi" dell'admin.
-- Solo oggetti nuovi: nessuna tabella esistente viene modificata.
--
-- Sicurezza:
-- - la tabella è leggibile e modificabile solo dall'amministratore
--   (public.is_admin()); i visitatori non possono né leggerla né scriverci
--   direttamente;
-- - il sito salva i messaggi solo attraverso la funzione
--   submit_contact_message, che controlla le lunghezze e limita gli invii
--   ripetuti dalla stessa connessione (massimo 5 in un'ora);
-- - l'indirizzo IP non viene mai salvato: solo un'impronta cifrata, usata
--   per il limite e cancellata dopo 24 ore;
-- - i messaggi più vecchi di 12 mesi vengono eliminati automaticamente
--   (a ogni nuovo messaggio e ogni giorno dal controllo programmato).

create table if not exists contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 254),
  message text not null check (char_length(message) between 1 and 5000),
  sender_hash text,
  email_sent boolean not null default false,
  read_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists contact_messages_created_at_idx
  on contact_messages (created_at desc);
create index if not exists contact_messages_sender_idx
  on contact_messages (sender_hash, created_at desc)
  where sender_hash is not null;

alter table contact_messages enable row level security;

drop policy if exists "messaggi solo admin" on contact_messages;
create policy "messaggi solo admin" on contact_messages
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Cancellazione automatica: messaggi oltre i 12 mesi e impronte oltre le
-- 24 ore. Non tocca nient'altro.
create or replace function public.purge_old_contact_messages()
returns void
language sql
security definer
set search_path = public
as $$
  delete from contact_messages where created_at < now() - interval '12 months';
  update contact_messages set sender_hash = null
    where sender_hash is not null and created_at < now() - interval '24 hours';
$$;

-- Salvataggio di un messaggio dal sito. Restituisce l'id del messaggio,
-- oppure null se la stessa connessione ha già inviato 5 messaggi
-- nell'ultima ora (il sito mostra allora un avviso gentile).
create or replace function public.submit_contact_message(
  p_name text,
  p_email text,
  p_message text,
  p_sender_hash text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  recent int;
  new_id uuid;
begin
  if p_sender_hash is not null then
    select count(*) into recent
      from contact_messages
      where sender_hash = p_sender_hash
        and created_at > now() - interval '1 hour';
    if recent >= 5 then
      return null;
    end if;
  end if;

  insert into contact_messages (name, email, message, sender_hash)
    values (left(trim(p_name), 100), left(trim(p_email), 254),
            left(trim(p_message), 5000), p_sender_hash)
    returning id into new_id;

  perform public.purge_old_contact_messages();
  return new_id;
end;
$$;

-- Segna che l'email di avviso per quel messaggio è partita. Accetta solo
-- messaggi appena creati, così non serve a modificare quelli vecchi.
create or replace function public.mark_contact_email_sent(p_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update contact_messages set email_sent = true
    where id = p_id and created_at > now() - interval '5 minutes';
$$;

-- Autorizzazioni esplicite (regola dal 30/10/2026, vedi 0011).
grant select, insert, update, delete on public.contact_messages
  to authenticated, service_role;

revoke all on function public.submit_contact_message(text, text, text, text) from public;
revoke all on function public.mark_contact_email_sent(uuid) from public;
revoke all on function public.purge_old_contact_messages() from public;
grant execute on function public.submit_contact_message(text, text, text, text)
  to anon, authenticated, service_role;
grant execute on function public.mark_contact_email_sent(uuid)
  to anon, authenticated, service_role;
grant execute on function public.purge_old_contact_messages()
  to anon, authenticated, service_role;

select 'ok' as esito;

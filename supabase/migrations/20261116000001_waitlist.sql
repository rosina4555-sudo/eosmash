-- EOSMASH waitlist tables
-- Run against the Supabase project's Postgres (SQL editor or psql).

create table if not exists public.waitlist_signups (
  id             uuid primary key default gen_random_uuid(),
  email          text not null,
  country        text,
  preferred_game text,
  device         text,
  created_at     timestamptz not null default now(),
  constraint waitlist_signups_email_key unique (email),
  constraint waitlist_signups_email_format_check
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint waitlist_signups_preferred_game_check
    check (preferred_game is null or preferred_game in
      ('fighting', 'racing', 'strategy', 'arcade', 'other', 'not_sure')),
  constraint waitlist_signups_device_check
    check (device is null or device in
      ('mobile', 'pc', 'console', 'multiple'))
);

-- Block duplicates that differ only by letter case.
create unique index if not exists waitlist_signups_email_lower_uniq
  on public.waitlist_signups (lower(email));

create index if not exists waitlist_signups_created_at_idx
  on public.waitlist_signups (created_at desc);

alter table public.waitlist_signups enable row level security;

-- Anyone can join, nobody but the service role can read.
drop policy if exists "anon can join waitlist" on public.waitlist_signups;
create policy "anon can join waitlist"
  on public.waitlist_signups
  for insert
  to anon, authenticated
  with check (true);

grant insert on public.waitlist_signups to anon, authenticated;
grant select, update, delete on public.waitlist_signups to service_role;

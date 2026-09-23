-- =============================================================================
-- 0012: retune accent themes (volt default, signal-orange/cobalt/magenta/teal)
-- =============================================================================
-- Replaces the 0011 accent set (amber/crimson/emerald/sapphire/violet/
-- rose/cyan) with the retuned brutalist set. Existing rows are mapped
-- to their closest retuned theme; nothing is left null.
--
-- APPLY: supabase db push  (or paste into the Supabase SQL editor)

-- 1. Drop the old check constraint.
alter table public.profiles
  drop constraint if exists profiles_accent_theme_check;

-- 2. Backfill existing rows to the retuned names.
update public.profiles set accent_theme = 'signal-orange' where accent_theme = 'amber';
update public.profiles set accent_theme = 'teal'            where accent_theme in ('emerald', 'cyan');
update public.profiles set accent_theme = 'cobalt'          where accent_theme = 'sapphire';
update public.profiles set accent_theme = 'magenta'         where accent_theme = 'rose';
-- crimson and violet carry over unchanged.

-- 3. Safety net: anything unexpected becomes the new default.
update public.profiles set accent_theme = 'volt'
  where accent_theme not in
    ('volt','signal-orange','crimson','cobalt','violet','magenta','teal');

-- 4. New default + check constraint.
alter table public.profiles
  alter column accent_theme set default 'volt';

alter table public.profiles
  add constraint profiles_accent_theme_check
  check (
    accent_theme in ('volt','signal-orange','crimson','cobalt','violet','magenta','teal')
  );

-- 5. New-user trigger writes the new default.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, accent_theme)
  values (
    new.id,
    lower(split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'volt'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 6. Dedupe category rows first, then create unique indexes.
-- Keep the row with the smallest id (oldest); delete the rest.
-- routine_categories
with dupes as (
  select id,
         row_number() over (
           partition by user_id, lower(name)
           order by created_at asc, id asc
         ) as rn
  from public.routine_categories
)
delete from public.routine_categories
 where id in (select id from dupes where rn > 1);

-- project_categories
with dupes as (
  select id,
         row_number() over (
           partition by user_id, lower(name)
           order by created_at asc, id asc
         ) as rn
  from public.project_categories
)
delete from public.project_categories
 where id in (select id from dupes where rn > 1);

create unique index if not exists routine_categories_user_name_uniq
  on public.routine_categories (user_id, lower(name));
create unique index if not exists project_categories_user_name_uniq
  on public.project_categories (user_id, lower(name));

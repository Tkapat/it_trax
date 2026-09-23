-- =============================================================================
-- TABLE: profiles.accent_theme — accent color theme (independent axis)
-- =============================================================================
-- Adds an independent accent color axis alongside dark/light mode.
-- Users can be in Dark mode with a Violet accent, Light mode with Cyan, etc.

alter table public.profiles
  add column if not exists accent_theme text not null default 'amber';

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
     where table_schema = 'public'
       and table_name   = 'profiles'
       and constraint_name = 'profiles_accent_theme_check'
  ) then
    alter table public.profiles
      add constraint profiles_accent_theme_check
        check (accent_theme in ('amber','crimson','emerald','sapphire','violet','rose','cyan'));
  end if;
end;
$$;

-- Update the auto-create profile function to include accent_theme.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url, accent_theme)
  values (
    new.id,
    lower(split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url',
    'amber'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- RLS: accent_theme is readable by the profile owner (same as theme).
-- Policy "profiles: select own" already covers all columns via auth.uid() = id.
-- No new policy needed.

-- 0005: routines.is_must_do — required by Routine tab spec (Phase 1 modal)
alter table public.routines
  add column if not exists is_must_do boolean not null default false;

grant select, insert, update, delete on all tables in schema public to anon, authenticated;
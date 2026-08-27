-- 0007: convert legacy enum-typed projects.status to text with new semantics
-- 0006's `add column if not exists status text` is a no-op on DBs where the
-- `status` column already exists as the `project_status` enum, so this
-- migration converts it in place. On fresh DBs (status already text) it is a
-- no-op.

-- 1. Drop the old default so the type change is allowed.
alter table projects alter column status drop default;

-- 2. Convert enum -> text only when it is not already text.
do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public'
       and table_name = 'projects'
       and column_name = 'status'
       and data_type <> 'text'
  ) then
    execute 'alter table public.projects alter column status type text using status::text';
  end if;
end $$;

-- 3. Re-home legacy values (now that the column is text).
--    'archived' -> moved to the is_archived flag (0006).
update projects set is_archived = true, status = 'in_progress' where status = 'archived';
--    'active'/'paused' -> default in-progress-state.
update projects set status = 'in_progress' where status in ('active', 'paused');

-- 4. Normalize the CHECK constraint + defaults to the new enum set.
alter table projects drop constraint if exists projects_status_check;
alter table projects add constraint projects_status_check
  check (status in ('in_progress', 'on_track', 'at_risk', 'completed'));
alter table projects alter column status set default 'in_progress';
alter table projects alter column status set not null;

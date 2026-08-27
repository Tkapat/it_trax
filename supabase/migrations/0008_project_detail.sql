-- 0008: project detail page support
--   * project-level fields (description / repo / dates)
--   * project_links table (useful links section)
--   * task_media extended for video + file metadata
-- Grants for the new table are covered by the default privileges set in 0003.

-- Project-level fields we don't have yet
alter table projects add column if not exists description text;
alter table projects add column if not exists repo_url text;         -- github link
alter table projects add column if not exists started_at date;
alter table projects add column if not exists target_date date;

-- Useful links section (new)
create table project_links (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  url text not null,
  favicon_url text,          -- fetched/cached from the link's domain
  position int default 0,
  created_at timestamptz default now()
);
alter table project_links enable row level security;
create policy "owner_only" on project_links for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Extend task_media to properly support video, and confirm text/pdf/image
alter table task_media drop constraint if exists task_media_file_type_check;
alter table task_media add constraint task_media_file_type_check
  check (file_type in ('image','video','pdf','text'));
alter table task_media add column if not exists file_size_bytes bigint;
alter table task_media add column if not exists file_name text;

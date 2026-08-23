-- =============================================================================
-- trax — Initial schema migration
-- 0001_initial_schema.sql
--
-- Tables: profiles, routines, routine_logs, tasks, task_logs,
--         streaks, projects, project_updates, project_media
-- + indexes, RLS policies (every row restricted to auth.uid() = user_id)
-- + heatmap view + helper functions
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid()
create extension if not exists "pg_trgm";    -- trigram indexes for text search

-- ---------------------------------------------------------------------------
-- Enum types
-- ---------------------------------------------------------------------------

create type public.routine_frequency as enum (
  'daily',
  'weekdays',
  'weekends',
  'custom'
);

create type public.task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

create type public.task_status as enum (
  'todo',
  'in_progress',
  'done',
  'cancelled'
);

create type public.project_status as enum (
  'active',
  'paused',
  'completed',
  'archived'
);

create type public.task_action as enum (
  'created',
  'status_changed',
  'due_date_changed',
  'completed',
  'reopened'
);

-- =============================================================================
-- TABLE: profiles
-- =============================================================================
-- One row per auth user, created automatically via trigger on auth.users insert.

create table public.profiles (
  id          uuid        primary key references auth.users(id) on delete cascade,
  username    text        not null unique,
  full_name   text,
  avatar_url  text,
  timezone    text        not null default 'Asia/Kolkata',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),

  constraint username_length check (char_length(username) between 3 and 30),
  constraint username_format check (username ~ '^[a-z0-9_]+$')
);

comment on table public.profiles is 'User profile data, one row per auth.users entry.';

-- Indexes
create index profiles_username_idx on public.profiles (username);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- Auto-create profile on sign up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    -- derive a default username from email prefix; user can update it later
    lower(split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;

create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- No insert/delete policies — insert is handled by trigger (security definer),
-- delete cascades from auth.users.

-- =============================================================================
-- TABLE: routines
-- =============================================================================

create table public.routines (
  id           uuid                    primary key default gen_random_uuid(),
  user_id      uuid                    not null references public.profiles(id) on delete cascade,
  name         text                    not null,
  description  text,
  frequency    public.routine_frequency not null default 'daily',
  time_of_day  time,                   -- HH:MM in user's local time
  custom_days  smallint[],             -- 0=Sun … 6=Sat, only for frequency='custom'
  is_active    boolean                 not null default true,
  created_at   timestamptz             not null default now(),
  updated_at   timestamptz             not null default now(),

  constraint routine_name_length check (char_length(name) between 1 and 120),
  constraint custom_days_range   check (
    custom_days is null
    or (array_length(custom_days, 1) > 0
        and custom_days <@ array[0,1,2,3,4,5,6]::smallint[])
  )
);

comment on table public.routines is 'User-defined habits or routines to track.';

-- Indexes
create index routines_user_id_idx      on public.routines (user_id);
create index routines_active_user_idx  on public.routines (user_id) where is_active = true;

create trigger routines_updated_at
  before update on public.routines
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.routines enable row level security;

create policy "routines: all own"
  on public.routines for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- TABLE: routine_logs
-- =============================================================================

create table public.routine_logs (
  id            uuid        primary key default gen_random_uuid(),
  routine_id    uuid        not null references public.routines(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  completed_at  timestamptz not null default now(),
  notes         text,
  created_at    timestamptz not null default now()
);

comment on table public.routine_logs is 'Each row records one completion event for a routine.';

-- Indexes
create index routine_logs_routine_id_idx       on public.routine_logs (routine_id);
create index routine_logs_user_id_idx          on public.routine_logs (user_id);
create index routine_logs_completed_at_idx     on public.routine_logs (completed_at desc);
create index routine_logs_user_completed_idx   on public.routine_logs (user_id, completed_at desc);

-- RLS
alter table public.routine_logs enable row level security;

create policy "routine_logs: all own"
  on public.routine_logs for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- TABLE: tasks
-- =============================================================================

create table public.tasks (
  id           uuid                 primary key default gen_random_uuid(),
  user_id      uuid                 not null references public.profiles(id) on delete cascade,
  project_id   uuid,                -- FK set after projects table is created (see below)
  title        text                 not null,
  description  text,
  due_date     date,
  priority     public.task_priority not null default 'medium',
  status       public.task_status   not null default 'todo',
  created_at   timestamptz          not null default now(),
  updated_at   timestamptz          not null default now(),

  constraint task_title_length check (char_length(title) between 1 and 200)
);

comment on table public.tasks is 'Individual to-do items, optionally linked to a project.';

-- Indexes
create index tasks_user_id_idx        on public.tasks (user_id);
create index tasks_user_status_idx    on public.tasks (user_id, status);
create index tasks_due_date_idx       on public.tasks (due_date) where due_date is not null;
create index tasks_project_id_idx     on public.tasks (project_id) where project_id is not null;

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.tasks enable row level security;

create policy "tasks: all own"
  on public.tasks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- TABLE: task_logs
-- =============================================================================

create table public.task_logs (
  id          uuid               primary key default gen_random_uuid(),
  task_id     uuid               not null references public.tasks(id) on delete cascade,
  user_id     uuid               not null references public.profiles(id) on delete cascade,
  action      public.task_action not null,
  metadata    jsonb,             -- before/after values for the action
  created_at  timestamptz        not null default now()
);

comment on table public.task_logs is 'Immutable audit log of task lifecycle events.';

-- Indexes
create index task_logs_task_id_idx   on public.task_logs (task_id);
create index task_logs_user_id_idx   on public.task_logs (user_id);
create index task_logs_created_idx   on public.task_logs (created_at desc);

-- RLS
alter table public.task_logs enable row level security;

create policy "task_logs: select own"
  on public.task_logs for select
  using (auth.uid() = user_id);

create policy "task_logs: insert own"
  on public.task_logs for insert
  with check (auth.uid() = user_id);

-- No update/delete — task_logs are immutable.

-- =============================================================================
-- TABLE: streaks
-- =============================================================================
-- Materialised streak cache updated by the app after each log insert.
-- One row per (user_id, routine_id). Upserted by the app.

create table public.streaks (
  id                   uuid        primary key default gen_random_uuid(),
  routine_id           uuid        not null references public.routines(id) on delete cascade,
  user_id              uuid        not null references public.profiles(id) on delete cascade,
  current_streak       integer     not null default 0,
  longest_streak       integer     not null default 0,
  last_completed_date  date,       -- date in user's timezone (app writes this)
  updated_at           timestamptz not null default now(),

  unique (routine_id, user_id),
  constraint streak_current_nonneg check (current_streak >= 0),
  constraint streak_longest_nonneg check (longest_streak >= 0),
  constraint streak_longest_gte_current check (longest_streak >= current_streak)
);

comment on table public.streaks is 'Cached streak counters per routine, maintained by the application layer.';

-- Indexes
create index streaks_user_id_idx     on public.streaks (user_id);
create index streaks_routine_id_idx  on public.streaks (routine_id);

-- RLS
alter table public.streaks enable row level security;

create policy "streaks: all own"
  on public.streaks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- TABLE: projects
-- =============================================================================

create table public.projects (
  id           uuid                   primary key default gen_random_uuid(),
  user_id      uuid                   not null references public.profiles(id) on delete cascade,
  name         text                   not null,
  description  text,
  github_url   text,
  status       public.project_status  not null default 'active',
  created_at   timestamptz            not null default now(),
  updated_at   timestamptz            not null default now(),

  constraint project_name_length   check (char_length(name) between 1 and 120),
  constraint github_url_format     check (
    github_url is null
    or github_url ~ '^https://github\.com/.+'
  )
);

comment on table public.projects is 'User projects with optional GitHub link.';

-- Indexes
create index projects_user_id_idx     on public.projects (user_id);
create index projects_status_idx      on public.projects (user_id, status);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.handle_updated_at();

-- RLS
alter table public.projects enable row level security;

create policy "projects: all own"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Now that projects table exists, add the FK from tasks.project_id
-- ---------------------------------------------------------------------------
alter table public.tasks
  add constraint tasks_project_id_fkey
  foreign key (project_id)
  references public.projects(id)
  on delete set null;

-- =============================================================================
-- TABLE: project_updates
-- =============================================================================

create table public.project_updates (
  id          uuid        primary key default gen_random_uuid(),
  project_id  uuid        not null references public.projects(id) on delete cascade,
  user_id     uuid        not null references public.profiles(id) on delete cascade,
  content     text        not null,
  created_at  timestamptz not null default now(),

  constraint project_update_content_length check (char_length(content) >= 1)
);

comment on table public.project_updates is 'Timestamped journal entries / update notes for a project.';

-- Indexes
create index project_updates_project_id_idx  on public.project_updates (project_id);
create index project_updates_user_id_idx     on public.project_updates (user_id);
create index project_updates_created_idx     on public.project_updates (project_id, created_at desc);

-- RLS
alter table public.project_updates enable row level security;

create policy "project_updates: all own"
  on public.project_updates for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- TABLE: project_media
-- =============================================================================

create table public.project_media (
  id            uuid        primary key default gen_random_uuid(),
  project_id    uuid        not null references public.projects(id) on delete cascade,
  user_id       uuid        not null references public.profiles(id) on delete cascade,
  storage_path  text        not null unique, -- path within the Supabase Storage bucket
  mime_type     text        not null,
  size_bytes    bigint      not null check (size_bytes > 0),
  created_at    timestamptz not null default now()
);

comment on table public.project_media is 'Media files uploaded to Supabase Storage and linked to a project.';

-- Indexes
create index project_media_project_id_idx  on public.project_media (project_id);
create index project_media_user_id_idx     on public.project_media (user_id);

-- RLS
alter table public.project_media enable row level security;

create policy "project_media: all own"
  on public.project_media for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- =============================================================================
-- STORAGE: project-media bucket + policies
-- =============================================================================
-- Run this in the Supabase dashboard Storage section OR via supabase CLI:
--
--   insert into storage.buckets (id, name, public)
--   values ('project-media', 'project-media', false);
--
-- RLS on storage.objects mirrors the table: user_id prefix in path.
-- Convention: storage_path = '{user_id}/{project_id}/{filename}'

insert into storage.buckets (id, name, public)
values ('project-media', 'project-media', false)
on conflict (id) do nothing;

create policy "storage: project-media upload own"
  on storage.objects for insert
  with check (
    bucket_id = 'project-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage: project-media read own"
  on storage.objects for select
  using (
    bucket_id = 'project-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "storage: project-media delete own"
  on storage.objects for delete
  using (
    bucket_id = 'project-media'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================================================
-- VIEW: routine_heatmap
-- =============================================================================
-- Returns one row per (user_id, local_date) with completion_count and
-- completion_ratio (against the number of active routines at query time).
--
-- Timezone: stored in profiles.timezone (default 'Asia/Kolkata').
-- The app should call this with the user's UID filtered via RLS.
--
-- Usage:
--   select * from public.routine_heatmap
--   where local_date between '2026-01-01' and '2026-12-31';

create or replace view public.routine_heatmap
  with (security_invoker = true)   -- respects RLS of underlying tables
as
with active_routine_counts as (
  -- count of currently-active routines per user
  select
    r.user_id,
    count(*) as active_count
  from public.routines r
  where r.is_active = true
  group by r.user_id
),
daily_completions as (
  select
    rl.user_id,
    -- cast to date in the user's timezone
    (rl.completed_at at time zone p.timezone)::date as local_date,
    -- deduplicate: count distinct routines completed on each day
    count(distinct rl.routine_id)                   as completion_count
  from public.routine_logs rl
  join public.profiles      p  on p.id = rl.user_id
  group by rl.user_id, local_date
)
select
  dc.user_id,
  dc.local_date,
  dc.completion_count,
  round(
    dc.completion_count::numeric
    / greatest(arc.active_count, 1)::numeric,
    4
  ) as completion_ratio
from daily_completions      dc
left join active_routine_counts arc on arc.user_id = dc.user_id
order by dc.user_id, dc.local_date;

comment on view public.routine_heatmap is
  'Per-user daily completion stats for calendar heatmap rendering. '
  'completion_ratio is capped relative to currently-active routines.';

-- =============================================================================
-- FUNCTION: get_heatmap_range(start_date date, end_date date)
-- =============================================================================
-- Returns heatmap data for the calling user for a given date range,
-- filling in zero-count days so the frontend can render a full grid.

create or replace function public.get_heatmap_range(
  start_date date,
  end_date   date
)
returns table (
  local_date        date,
  completion_count  bigint,
  completion_ratio  numeric
)
language sql
security invoker  -- runs as the calling user; RLS on routine_heatmap applies
stable
as $$
  with date_series as (
    select generate_series(start_date, end_date, '1 day'::interval)::date as local_date
  ),
  user_heatmap as (
    select
      h.local_date,
      h.completion_count,
      h.completion_ratio
    from public.routine_heatmap h
    where h.user_id = auth.uid()
      and h.local_date between start_date and end_date
  )
  select
    ds.local_date,
    coalesce(uh.completion_count, 0)    as completion_count,
    coalesce(uh.completion_ratio, 0.0)  as completion_ratio
  from date_series ds
  left join user_heatmap uh using (local_date)
  order by ds.local_date;
$$;

comment on function public.get_heatmap_range is
  'Returns daily heatmap data for the authenticated user, filling zero-count gaps '
  'so the frontend can render a complete calendar grid without client-side date math.';

-- =============================================================================
-- FUNCTION: get_today_routines()
-- =============================================================================
-- Returns all active routines for the calling user that are due today
-- (according to their timezone stored in profiles), joined with today's
-- completion status.

create or replace function public.get_today_routines()
returns table (
  routine_id       uuid,
  name             text,
  description      text,
  frequency        public.routine_frequency,
  time_of_day      time,
  completed_today  boolean,
  completed_at     timestamptz
)
language sql
security invoker
stable
as $$
  with user_tz as (
    select timezone from public.profiles where id = auth.uid()
  ),
  today_completions as (
    select
      rl.routine_id,
      min(rl.completed_at) as first_completion
    from public.routine_logs rl, user_tz
    where rl.user_id = auth.uid()
      and (rl.completed_at at time zone user_tz.timezone)::date
          = (now() at time zone user_tz.timezone)::date
    group by rl.routine_id
  )
  select
    r.id             as routine_id,
    r.name,
    r.description,
    r.frequency,
    r.time_of_day,
    (tc.routine_id is not null) as completed_today,
    tc.first_completion         as completed_at
  from public.routines r
  left join today_completions tc on tc.routine_id = r.id
  where r.user_id = auth.uid()
    and r.is_active = true
  order by r.time_of_day asc nulls last, r.created_at asc;
$$;

comment on function public.get_today_routines is
  'Returns active routines for today with their completion status, timezone-aware.';

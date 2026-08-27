-- =============================================================================
-- trax — Migration 0003: categories, books, task-tree, todos, reminders, theme
-- =============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES: theme preference (timezone already exists from 0001)
-- ---------------------------------------------------------------------------
alter table public.profiles
  add column if not exists theme text default 'dark'
  check (theme in ('dark','light'));

-- ---------------------------------------------------------------------------
-- ROUTINE LOGS: late-grace-period marking
-- ---------------------------------------------------------------------------
alter table public.routine_logs
  add column if not exists logged_late boolean default false;

-- ---------------------------------------------------------------------------
-- CATEGORIES (separate sets for routines vs projects)
-- ---------------------------------------------------------------------------
create table if not exists public.routine_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  icon       text,
  position   int default 0,
  created_at timestamptz default now()
);

create table if not exists public.project_categories (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  position   int default 0,
  created_at timestamptz default now()
);

create index if not exists routine_categories_user_idx on public.routine_categories (user_id, position);
create index if not exists project_categories_user_idx on public.project_categories (user_id, position);

-- ---------------------------------------------------------------------------
-- ROUTINES: category link + book type flag
-- ---------------------------------------------------------------------------
alter table public.routines
  add column if not exists category_id uuid references public.routine_categories(id) on delete set null;
alter table public.routines
  add column if not exists type text not null default 'standard'
  check (type in ('standard','book'));

create index if not exists routines_category_idx on public.routines (category_id) where category_id is not null;

-- ---------------------------------------------------------------------------
-- BOOK FEATURE
-- ---------------------------------------------------------------------------
create table if not exists public.books (
  id           uuid primary key default gen_random_uuid(),
  routine_id   uuid not null references public.routines(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  author       text,
  isbn         text,
  cover_url    text,
  total_pages  int,
  current_page int default 0,
  status       text default 'reading' check (status in ('want_to_read','reading','finished')),
  started_at   date,
  finished_at  date,
  created_at   timestamptz default now(),

  constraint books_pages_check check (
    total_pages is null or total_pages > 0
  ),
  constraint books_current_page_check check (
    current_page >= 0 and (total_pages is null or current_page <= total_pages)
  )
);

create table if not exists public.reading_sessions (
  id           uuid primary key default gen_random_uuid(),
  book_id      uuid not null references public.books(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  date         date not null default current_date,
  pages_read   int not null check (pages_read > 0),
  minutes_spent int,
  note         text,
  created_at   timestamptz default now()
);

create table if not exists public.book_highlights (
  id             uuid primary key default gen_random_uuid(),
  book_id        uuid not null references public.books(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  page_number    int,
  image_url      text,
  extracted_text text,
  created_at     timestamptz default now()
);

create index if not exists books_routine_idx        on public.books (routine_id);
create index if not exists reading_sessions_book_idx on public.reading_sessions (book_id, date desc);
create index if not exists book_highlights_book_idx  on public.book_highlights (book_id);

-- ---------------------------------------------------------------------------
-- PROJECTS: category link
-- ---------------------------------------------------------------------------
alter table public.projects
  add column if not exists category_id uuid references public.project_categories(id) on delete set null;

create index if not exists projects_category_idx on public.projects (category_id) where category_id is not null;

-- ---------------------------------------------------------------------------
-- PROJECT TASK TREE (self-referencing)
-- ---------------------------------------------------------------------------
create table if not exists public.project_tasks (
  id             uuid primary key default gen_random_uuid(),
  project_id     uuid not null references public.projects(id) on delete cascade,
  parent_task_id uuid references public.project_tasks(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  name           text not null,
  is_completed   boolean default false,
  position       int default 0,
  created_at     timestamptz default now()
);

create index if not exists project_tasks_project_idx on public.project_tasks (project_id, position);
create index if not exists project_tasks_parent_idx  on public.project_tasks (parent_task_id);

-- ---------------------------------------------------------------------------
-- MEDIA: attachable to whole project OR a specific task (exactly one)
-- ---------------------------------------------------------------------------
create table if not exists public.task_media (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  project_id  uuid references public.projects(id) on delete cascade,
  task_id     uuid references public.project_tasks(id) on delete cascade,
  file_url    text not null,
  file_type   text check (file_type in ('image','pdf','text')),
  caption     text,
  created_at  timestamptz default now(),

  constraint media_attached_to_one check (
    (project_id is not null and task_id is null) or
    (project_id is null and task_id is not null)
  )
);

create index if not exists task_media_project_idx on public.task_media (project_id) where project_id is not null;
create index if not exists task_media_task_idx    on public.task_media (task_id) where task_id is not null;

-- ---------------------------------------------------------------------------
-- TODOS (flat list — deliberately separate from project task trees)
-- ---------------------------------------------------------------------------
create table if not exists public.todos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  description  text,
  priority     text default 'med' check (priority in ('high','med','low')),
  due_date     date,
  is_completed boolean default false,
  project_id   uuid references public.projects(id) on delete set null,
  created_at   timestamptz default now()
);

create index if not exists todos_user_due_idx      on public.todos (user_id, due_date);
create index if not exists todos_user_completed_idx on public.todos (user_id, is_completed);
create index if not exists todos_project_idx       on public.todos (project_id) where project_id is not null;

-- ---------------------------------------------------------------------------
-- REMINDERS (generic: routine | todo | project_task)
-- ---------------------------------------------------------------------------
create table if not exists public.reminders (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_type   text not null check (item_type in ('routine','todo','project_task')),
  item_id     uuid not null,
  remind_at   time not null,
  repeat_rule text default 'once' check (repeat_rule in ('once','daily','weekdays')),
  created_at  timestamptz default now()
);

create index if not exists reminders_user_item_idx on public.reminders (user_id, item_type, item_id);

-- ---------------------------------------------------------------------------
-- STREAK TRIGGER: already exists from 0002_streak_trigger.sql
-- (trg recalculate_streak on routine_logs insert/delete).
-- Do NOT recreate — the version in 0002 handles our row-per-completion
-- logs schema and the (routine_id, user_id) unique constraint correctly.
-- ---------------------------------------------------------------------------

-- =============================================================================
-- RLS — enable + owner-only policy on every new table
-- =============================================================================
alter table public.routine_categories enable row level security;
alter table public.project_categories enable row level security;
alter table public.books              enable row level security;
alter table public.reading_sessions   enable row level security;
alter table public.book_highlights    enable row level security;
alter table public.project_tasks      enable row level security;
alter table public.task_media         enable row level security;
alter table public.todos              enable row level security;
alter table public.reminders          enable row level security;

create policy "owner_only" on public.routine_categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.project_categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.books for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.reading_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.book_highlights for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.project_tasks for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.task_media for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.todos for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "owner_only" on public.reminders for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- =============================================================================
-- GRANTS — new tables need API-role access (same as 0003_grants.sql).
-- Default privileges may not cover tables created by a different role.
-- =============================================================================
grant select, insert, update, delete on
  public.routine_categories,
  public.project_categories,
  public.books,
  public.reading_sessions,
  public.book_highlights,
  public.project_tasks,
  public.task_media,
  public.todos,
  public.reminders
to anon, authenticated;
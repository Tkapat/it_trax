-- 0009: book notes tree
--   * self-referencing tree (same pattern as project_tasks) for chapters →
--     sections → keynotes, arbitrarily deep.
-- Grants for the new table are covered by the default privileges set in 0003.

create table book_notes (
  id uuid primary key default gen_random_uuid(),
  book_id uuid not null references books(id) on delete cascade,
  parent_note_id uuid references book_notes(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,                    -- e.g. chapter/section name, optional
  content text,                  -- the actual note/keynote text
  page_reference int,            -- optional page this note relates to
  position int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on book_notes (book_id);
create index on book_notes (parent_note_id);

alter table book_notes enable row level security;
create policy "owner_only" on book_notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

alter table projects add column if not exists status text 
  check (status in ('in_progress','on_track','at_risk','completed')) 
  default 'in_progress';
alter table projects add column if not exists icon text; -- icon identifier, user-selectable
alter table projects add column if not exists is_archived boolean default false;
alter table project_tasks add column if not exists due_date date;

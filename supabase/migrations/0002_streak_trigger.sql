-- =============================================================================
-- MIGRATION: Add automatic streak recalculation trigger
-- 0002_streak_trigger.sql
-- =============================================================================

-- Function to recalculate and upsert streak for a routine
create or replace function public.recalculate_streak(
  p_routine_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_timezone text;
  v_logs record;
  v_current_streak int := 0;
  v_longest_streak int := 0;
  v_last_completed_date date;
  v_today date;
  v_yesterday date;
  v_cursor date;
  v_date_set record;
begin
  -- Get user's timezone
  select timezone into v_timezone
  from public.profiles
  where id = p_user_id;

  if v_timezone is null then
    v_timezone := 'Asia/Kolkata';
  end if;

  -- Get all unique completion dates for this routine (in user's timezone)
  create temp table temp_streak_dates on commit drop as
  select distinct (completed_at at time zone v_timezone)::date as local_date
  from public.routine_logs
  where routine_id = p_routine_id
    and user_id = p_user_id
  order by local_date desc;

  -- Get today and yesterday in user's timezone
  v_today := (now() at time zone v_timezone)::date;
  v_yesterday := v_today - interval '1 day';

  -- Check if there's a completion today or yesterday
  select exists (
    select 1 from temp_streak_dates
    where local_date in (v_today, v_yesterday)
  ) into v_date_set;

  if not v_date_set then
    -- Streak is broken, current_streak = 0
    v_current_streak := 0;
  else
    -- Calculate current streak by walking back from most recent completion
    select local_date into v_cursor
    from temp_streak_dates
    order by local_date desc
    limit 1;

    v_current_streak := 0;
    while exists (select 1 from temp_streak_dates where local_date = v_cursor) loop
      v_current_streak := v_current_streak + 1;
      v_cursor := v_cursor - interval '1 day';
    end loop;
  end if;

  -- Calculate longest streak by scanning all dates in ascending order
  create temp table temp_ascending on commit drop as
  select local_date from temp_streak_dates order by local_date asc;

  declare
    v_prev_date date;
    v_run_length int := 1;
  begin
    v_longest_streak := 0;
    for v_logs in select local_date from temp_ascending loop
      if v_prev_date is not null then
        if v_logs.local_date = v_prev_date + interval '1 day' then
          v_run_length := v_run_length + 1;
        else
          v_longest_streak := greatest(v_longest_streak, v_run_length);
          v_run_length := 1;
        end if;
      end if;
      v_prev_date := v_logs.local_date;
    end loop;
    v_longest_streak := greatest(v_longest_streak, v_run_length);
  end;

  -- Get last completed date
  select local_date into v_last_completed_date
  from temp_streak_dates
  order by local_date desc
  limit 1;

  -- Upsert into streaks table
  insert into public.streaks (routine_id, user_id, current_streak, longest_streak, last_completed_date, updated_at)
  values (p_routine_id, p_user_id, v_current_streak, v_longest_streak, v_last_completed_date, now())
  on conflict (routine_id, user_id) do update set
    current_streak = excluded.current_streak,
    longest_streak = excluded.longest_streak,
    last_completed_date = excluded.last_completed_date,
    updated_at = now();
end;
$$;

-- Trigger function to call recalculate_streak after routine_logs insert/delete
create or replace function public.trigger_recalculate_streak()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- NEW is available on INSERT, OLD on DELETE
  perform public.recalculate_streak(
    coalesce(NEW.routine_id, OLD.routine_id),
    coalesce(NEW.user_id, OLD.user_id)
  );
  return null; -- result is ignored since this is an AFTER trigger
end;
$$;

-- Create triggers on routine_logs
drop trigger if exists routine_logs_recalc_streak_insert on public.routine_logs;
create trigger routine_logs_recalc_streak_insert
  after insert on public.routine_logs
  for each row
  execute function public.trigger_recalculate_streak();

drop trigger if exists routine_logs_recalc_streak_delete on public.routine_logs;
create trigger routine_logs_recalc_streak_delete
  after delete on public.routine_logs
  for each row
  execute function public.trigger_recalculate_streak();

-- Recalculate streaks for all existing data
-- (run once after migration)
do $$
declare
  r record;
begin
  for r in select distinct routine_id, user_id from public.routine_logs loop
    perform public.recalculate_streak(r.routine_id, r.user_id);
  end loop;
end;
$$;
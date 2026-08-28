-- =============================================================================
-- MIGRATION: Fix bugs in recalculate_streak (0002)
-- 0010_fix_streak_trigger.sql
--
-- Two bugs in the ORIGINAL 0002 function, both triggered on any routine
-- checkbox tap (the AFTER INSERT trigger on routine_logs calls this):
--
--  1) `v_date_set` was declared `record;` but used as a boolean
--     (`if not v_date_set then`). PL/pgSQL rejects boolean context on a
--     record, so every single tap threw:
--        argument of NOT must be type boolean, not type record (SQLSTATE 42804)
--     and the routine_logs insert was rolled back. Fixed: declare boolean.
--
--  2) The temp tables used fixed names with `on commit drop`, so a SECOND
--     invocation within the same transaction (another tap / 0002's own
--     backfill loop / any multi-insert) collided on the still-uncommitted
--     table:  relation "temp_streak_dates" already exists (SQLSTATE 42P07).
--     Fixed: drop each temp table before creating it.
-- =============================================================================

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
  v_date_set boolean;
begin
  -- Get user's timezone
  select timezone into v_timezone
  from public.profiles
  where id = p_user_id;

  if v_timezone is null then
    v_timezone := 'Asia/Kolkata';
  end if;

  -- Get all unique completion dates for this routine (in user's timezone)
  drop table if exists temp_streak_dates;
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
  drop table if exists temp_ascending;
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

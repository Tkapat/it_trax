/**
 * @trax/core — Streak calculation
 *
 * Pure function — no Supabase calls, no side effects.
 * Takes raw RoutineLog rows and computes current + longest streak.
 *
 * Timezone-aware using the Temporal API (@js-temporal/polyfill).
 * Default timezone: "Asia/Kolkata" (IST, UTC+5:30).
 *
 * Streak definition:
 *   - One completion per calendar day counts (duplicates in a day are ignored).
 *   - A streak is consecutive days walking back from "today" (inclusive).
 *   - If today has no completion but yesterday does, the streak is still alive
 *     (it "started" yesterday and is not yet broken).
 *   - The streak breaks when there is a day gap > 1 between logged days.
 */

import { Temporal } from "@js-temporal/polyfill";
import type { RoutineLog } from "../types/domain.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StreakResult {
  /** Number of consecutive days up to and including today (or yesterday) */
  currentStreak: number;
  /** Longest consecutive-day run in the full history */
  longestStreak: number;
  /** The most recent completion date as YYYY-MM-DD in the given timezone */
  lastCompletedDate: string | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts a timestamptz ISO string to a `Temporal.PlainDate` in the given timezone.
 */
function toPlainDate(
  completedAt: string,
  timezone: string
): Temporal.PlainDate {
  const instant = Temporal.Instant.from(completedAt);
  const zdt = instant.toZonedDateTimeISO(timezone);
  return zdt.toPlainDate();
}

/**
 * Returns a sorted, deduplicated array of `Temporal.PlainDate` values (descending).
 */
function uniqueDatesDescending(
  logs: ReadonlyArray<Pick<RoutineLog, "completed_at">>,
  timezone: string
): Temporal.PlainDate[] {
  const seen = new Set<string>();
  const dates: Temporal.PlainDate[] = [];

  for (const log of logs) {
    const date = toPlainDate(log.completed_at, timezone);
    const key = date.toString();
    if (!seen.has(key)) {
      seen.add(key);
      dates.push(date);
    }
  }

  // Sort descending (most recent first)
  dates.sort((a, b) => Temporal.PlainDate.compare(b, a));
  return dates;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Calculates current and longest streaks from a set of routine completion logs.
 *
 * @param routineId  - The routine's ID (unused in calculation, kept for traceability)
 * @param logs       - Array of RoutineLog rows (only `completed_at` is used)
 * @param today      - Reference "today" date as a JS Date (injectable for tests); defaults to now
 * @param timezone   - IANA timezone name; defaults to "Asia/Kolkata"
 *
 * @example
 * const result = calculateStreak("routine-123", logs)
 * // { currentStreak: 5, longestStreak: 12, lastCompletedDate: "2026-08-23" }
 */
export function calculateStreak(
  routineId: string,
  logs: ReadonlyArray<Pick<RoutineLog, "completed_at">>,
  today?: Date,
  timezone: string = "Asia/Kolkata"
): StreakResult {
  // Suppress unused-var lint for routineId (kept for call-site traceability)
  void routineId;

  if (logs.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  const dates = uniqueDatesDescending(logs, timezone);
  const lastDate = dates[0];

  if (!lastDate) {
    return { currentStreak: 0, longestStreak: 0, lastCompletedDate: null };
  }

  // Determine "today" in the given timezone
  const nowInstant = today
    ? Temporal.Instant.fromEpochMilliseconds(today.getTime())
    : Temporal.Now.instant();
  const todayDate = nowInstant.toZonedDateTimeISO(timezone).toPlainDate();

  // ---------------------------------------------------------------------------
  // Current streak — walk back from today
  // ---------------------------------------------------------------------------
  const daysSinceLastCompletion = todayDate.since(lastDate, {
    largestUnit: "days",
  }).days;

  let currentStreak = 0;

  if (daysSinceLastCompletion <= 1) {
    // Streak is still alive (completed today or yesterday)
    const dateSet = new Set(dates.map((d) => d.toString()));

    // Start from the most recent completed date and walk backwards
    let cursor = lastDate;
    while (dateSet.has(cursor.toString())) {
      currentStreak += 1;
      cursor = cursor.subtract({ days: 1 });
    }
  }
  // else: gap > 1 day → streak is broken, currentStreak stays 0

  // ---------------------------------------------------------------------------
  // Longest streak — scan all dates for the longest consecutive run
  // ---------------------------------------------------------------------------
  // dates is sorted descending; iterate in ascending order for easier logic
  const ascending = [...dates].reverse();
  let longestStreak = 0;
  let runLength = 1;

  for (let i = 1; i < ascending.length; i++) {
    const prev = ascending[i - 1];
    const curr = ascending[i];

    if (!prev || !curr) continue;

    const gap = curr.since(prev, { largestUnit: "days" }).days;

    if (gap === 1) {
      runLength += 1;
    } else {
      longestStreak = Math.max(longestStreak, runLength);
      runLength = 1;
    }
  }
  longestStreak = Math.max(longestStreak, runLength);

  return {
    currentStreak,
    longestStreak,
    lastCompletedDate: lastDate.toString(),
  };
}

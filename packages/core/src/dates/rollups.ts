/**
 * @trax/core — Date utility functions
 *
 * Timezone-aware date helpers for daily/monthly/yearly stat rollups.
 * Uses the Temporal API (@js-temporal/polyfill).
 *
 * All functions are pure — no I/O, no Supabase calls.
 */

import { Temporal } from "@js-temporal/polyfill";
import type { RoutineLog } from "../types/domain.js";

// ---------------------------------------------------------------------------
// Core conversion
// ---------------------------------------------------------------------------

/**
 * Converts a UTC timestamptz ISO string to a local date string `YYYY-MM-DD`
 * in the given IANA timezone.
 *
 * @example
 * toLocalDateString("2026-08-22T20:31:00Z", "Asia/Kolkata")
 * // → "2026-08-23"  (IST is UTC+5:30, so 20:31 UTC = 02:01 IST next day)
 */
export function toLocalDateString(
  completedAt: string,
  timezone: string
): string {
  const instant = Temporal.Instant.from(completedAt);
  return instant.toZonedDateTimeISO(timezone).toPlainDate().toString();
}

/**
 * Converts a UTC timestamptz ISO string to a local month string `YYYY-MM`
 * in the given IANA timezone.
 */
export function toLocalMonthString(
  completedAt: string,
  timezone: string
): string {
  const instant = Temporal.Instant.from(completedAt);
  const date = instant.toZonedDateTimeISO(timezone).toPlainDate();
  const month = String(date.month).padStart(2, "0");
  return `${date.year}-${month}`;
}

/**
 * Converts a UTC timestamptz ISO string to a local year string `YYYY`
 * in the given IANA timezone.
 */
export function toLocalYearString(
  completedAt: string,
  timezone: string
): string {
  const instant = Temporal.Instant.from(completedAt);
  return String(instant.toZonedDateTimeISO(timezone).toPlainDate().year);
}

// ---------------------------------------------------------------------------
// Grouping helpers (generic over any type that has completed_at)
// ---------------------------------------------------------------------------

/**
 * Groups items by calendar day in the given timezone.
 *
 * @returns Map keyed by `YYYY-MM-DD`
 *
 * @example
 * const byDay = groupByDay(logs, "Asia/Kolkata")
 * // Map { "2026-08-23" => [...logs], "2026-08-22" => [...logs] }
 */
export function groupByDay<T extends { completed_at: string }>(
  items: ReadonlyArray<T>,
  timezone: string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = toLocalDateString(item.completed_at, timezone);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

/**
 * Groups items by calendar month in the given timezone.
 *
 * @returns Map keyed by `YYYY-MM`
 */
export function groupByMonth<T extends { completed_at: string }>(
  items: ReadonlyArray<T>,
  timezone: string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = toLocalMonthString(item.completed_at, timezone);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

/**
 * Groups items by calendar year in the given timezone.
 *
 * @returns Map keyed by `YYYY`
 */
export function groupByYear<T extends { completed_at: string }>(
  items: ReadonlyArray<T>,
  timezone: string
): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = toLocalYearString(item.completed_at, timezone);
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return map;
}

// ---------------------------------------------------------------------------
// Stat rollup types
// ---------------------------------------------------------------------------

export interface DailyStat {
  /** YYYY-MM-DD in the user's timezone */
  date: string;
  count: number;
}

export interface MonthlyStat {
  /** YYYY-MM */
  month: string;
  count: number;
}

export interface YearlyStat {
  /** YYYY */
  year: string;
  count: number;
}

// ---------------------------------------------------------------------------
// Stat rollup functions (RoutineLog-specific)
// ---------------------------------------------------------------------------

/**
 * Produces a daily completion count array from routine logs, sorted ascending by date.
 */
export function dailyStats(
  logs: ReadonlyArray<Pick<RoutineLog, "completed_at">>,
  timezone: string
): DailyStat[] {
  const byDay = groupByDay(logs, timezone);
  return [...byDay.entries()]
    .map(([date, items]) => ({ date, count: items.length }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Produces a monthly completion count array from routine logs, sorted ascending by month.
 */
export function monthlyStats(
  logs: ReadonlyArray<Pick<RoutineLog, "completed_at">>,
  timezone: string
): MonthlyStat[] {
  const byMonth = groupByMonth(logs, timezone);
  return [...byMonth.entries()]
    .map(([month, items]) => ({ month, count: items.length }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Produces a yearly completion count array from routine logs, sorted ascending by year.
 */
export function yearlyStats(
  logs: ReadonlyArray<Pick<RoutineLog, "completed_at">>,
  timezone: string
): YearlyStat[] {
  const byYear = groupByYear(logs, timezone);
  return [...byYear.entries()]
    .map(([year, items]) => ({ year, count: items.length }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

// ---------------------------------------------------------------------------
// Calendar heatmap helper
// ---------------------------------------------------------------------------

export interface HeatmapDataPoint {
  /** YYYY-MM-DD in the user's timezone */
  date: string;
  /** Total completions logged on this day (across all routines passed in) */
  completionCount: number;
  /**
   * Ratio in [0, 1]: completions / totalRoutines.
   * Pass `totalActiveRoutines` from the calling context.
   */
  completionRatio: number;
}

/**
 * Generates calendar heatmap data points from a set of routine logs.
 *
 * @param logs              - All RoutineLog rows in the date range
 * @param totalActiveRoutines - Number of active routines at that time (used for ratio)
 * @param timezone          - IANA timezone
 *
 * @example
 * const heatmap = buildHeatmapData(logs, 5, "Asia/Kolkata")
 * // [{ date: "2026-08-01", completionCount: 3, completionRatio: 0.6 }, ...]
 */
export function buildHeatmapData(
  logs: ReadonlyArray<Pick<RoutineLog, "completed_at">>,
  totalActiveRoutines: number,
  timezone: string
): HeatmapDataPoint[] {
  const byDay = groupByDay(logs, timezone);
  const safeTotal = Math.max(totalActiveRoutines, 1);

  return [...byDay.entries()]
    .map(([date, items]) => {
      const completionCount = items.length;
      return {
        date,
        completionCount,
        completionRatio: Math.min(completionCount / safeTotal, 1),
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

// ---------------------------------------------------------------------------
// Range helpers
// ---------------------------------------------------------------------------

/**
 * Returns an array of YYYY-MM-DD strings for every day in [startDate, endDate],
 * inclusive. Useful for rendering a full calendar grid (filling in zero-count days).
 *
 * @param startDate - ISO date string YYYY-MM-DD
 * @param endDate   - ISO date string YYYY-MM-DD
 */
export function dateRange(startDate: string, endDate: string): string[] {
  const start = Temporal.PlainDate.from(startDate);
  const end = Temporal.PlainDate.from(endDate);
  const days: string[] = [];
  let cursor = start;

  while (Temporal.PlainDate.compare(cursor, end) <= 0) {
    days.push(cursor.toString());
    cursor = cursor.add({ days: 1 });
  }

  return days;
}

/**
 * Returns the ISO date string for the start of the current month
 * in the given timezone.
 */
export function startOfMonth(timezone: string): string {
  const today = Temporal.Now.plainDateISO(timezone);
  return today.with({ day: 1 }).toString();
}

/**
 * Returns the ISO date string for today in the given timezone.
 */
export function todayInTimezone(timezone: string): string {
  return Temporal.Now.plainDateISO(timezone).toString();
}

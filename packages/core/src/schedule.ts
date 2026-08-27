import { Temporal } from "@js-temporal/polyfill";
import type { RoutineFrequency } from "./types/domain.js";

/**
 * Is a routine scheduled on the given date?
 *
 * @param frequency   routine frequency
 * @param customDays  for frequency='custom': 0=Sun … 6=Sat
 * @param dateISO     YYYY-MM-DD
 */
export function isScheduledOn(
  frequency: RoutineFrequency,
  customDays: number[] | null,
  dateISO: string
): boolean {
  const day = Temporal.PlainDate.from(dateISO).dayOfWeek; // 1=Mon … 7=Sun
  const jsDay = day % 7; // 0=Sun … 6=Sat

  switch (frequency) {
    case "daily":
      return true;
    case "weekdays":
      return jsDay >= 1 && jsDay <= 5;
    case "weekends":
      return jsDay === 0 || jsDay === 6;
    case "custom":
      return Array.isArray(customDays) && customDays.includes(jsDay);
    default:
      return false;
  }
}

/** Time-of-day greeting key based on 24h hour. */
export function timeOfDayGreeting(hour: number): "morning" | "afternoon" | "evening" {
  if (hour >= 5 && hour < 12) return "morning";
  if (hour >= 12 && hour < 17) return "afternoon";
  return "evening";
}
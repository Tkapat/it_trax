/**
 * Unit tests for calculateStreak
 *
 * Uses Vitest. All edge cases are covered with an injectable `today` date so
 * tests are deterministic regardless of when they run.
 *
 * Reference "today" for all tests: 2026-08-23T00:00:00Z (which is 2026-08-23 05:30 IST)
 */

import { describe, expect, it } from "vitest";
import { calculateReadingStreak, calculateStreak } from "./calculate.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a RoutineLog stub with a UTC ISO timestamp */
function log(utcIso: string) {
  return { completed_at: utcIso };
}

/**
 * "Today" for all tests: 2026-08-23 at noon IST.
 * UTC equivalent: 2026-08-23T06:30:00Z
 */
const TODAY = new Date("2026-08-23T06:30:00Z");

const TZ = "Asia/Kolkata";

// ---------------------------------------------------------------------------
// Basic cases
// ---------------------------------------------------------------------------

describe("calculateStreak — empty logs", () => {
  it("returns zeroes and null lastCompletedDate", () => {
    const result = calculateStreak("r1", [], TODAY, TZ);
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    });
  });
});

describe("calculateStreak — single log today", () => {
  it("returns streak of 1", () => {
    // 2026-08-23T06:00:00Z = 2026-08-23 11:30 IST → today
    const result = calculateStreak(
      "r1",
      [log("2026-08-23T06:00:00Z")],
      TODAY,
      TZ
    );
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: "2026-08-23",
    });
  });
});

describe("calculateStreak — single log yesterday", () => {
  it("returns streak of 1 (still alive — gap = 1 day)", () => {
    // 2026-08-22T06:00:00Z = 2026-08-22 IST → yesterday
    const result = calculateStreak(
      "r1",
      [log("2026-08-22T06:00:00Z")],
      TODAY,
      TZ
    );
    expect(result).toEqual({
      currentStreak: 1,
      longestStreak: 1,
      lastCompletedDate: "2026-08-22",
    });
  });
});

describe("calculateStreak — single log 2 days ago", () => {
  it("returns currentStreak 0 (streak broken)", () => {
    const result = calculateStreak(
      "r1",
      [log("2026-08-21T06:00:00Z")],
      TODAY,
      TZ
    );
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 1,
      lastCompletedDate: "2026-08-21",
    });
  });
});

// ---------------------------------------------------------------------------
// Multi-day consecutive streak
// ---------------------------------------------------------------------------

describe("calculateStreak — 5-day consecutive streak ending today", () => {
  it("currentStreak = 5, longestStreak = 5", () => {
    const logs = [
      log("2026-08-19T06:00:00Z"), // Aug 19 IST
      log("2026-08-20T06:00:00Z"), // Aug 20 IST
      log("2026-08-21T06:00:00Z"), // Aug 21 IST
      log("2026-08-22T06:00:00Z"), // Aug 22 IST
      log("2026-08-23T06:00:00Z"), // Aug 23 IST (today)
    ];
    const result = calculateStreak("r1", logs, TODAY, TZ);
    expect(result.currentStreak).toBe(5);
    expect(result.longestStreak).toBe(5);
    expect(result.lastCompletedDate).toBe("2026-08-23");
  });
});

describe("calculateStreak — gap in middle, streak ends today", () => {
  it("currentStreak = 3 (today, yesterday, day before), longestStreak = 5", () => {
    const logs = [
      // Older run of 5 consecutive days
      log("2026-08-10T06:00:00Z"),
      log("2026-08-11T06:00:00Z"),
      log("2026-08-12T06:00:00Z"),
      log("2026-08-13T06:00:00Z"),
      log("2026-08-14T06:00:00Z"),
      // Gap: 15, 16, 17, 18, 19 missing
      // Current run: 21, 22, 23
      log("2026-08-21T06:00:00Z"),
      log("2026-08-22T06:00:00Z"),
      log("2026-08-23T06:00:00Z"),
    ];
    const result = calculateStreak("r1", logs, TODAY, TZ);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(5);
    expect(result.lastCompletedDate).toBe("2026-08-23");
  });
});

// ---------------------------------------------------------------------------
// Deduplication — multiple logs on the same day count as one
// ---------------------------------------------------------------------------

describe("calculateStreak — duplicate logs on the same day", () => {
  it("deduplicates correctly", () => {
    const logs = [
      log("2026-08-23T03:00:00Z"), // morning IST
      log("2026-08-23T09:00:00Z"), // afternoon IST
      log("2026-08-23T13:00:00Z"), // evening IST
    ];
    const result = calculateStreak("r1", logs, TODAY, TZ);
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Timezone boundary — IST midnight edge cases
// ---------------------------------------------------------------------------

describe("calculateStreak — IST midnight boundary", () => {
  it("a log at 23:59 IST (18:29 UTC) is on the correct IST date", () => {
    // 2026-08-22T18:29:00Z = 2026-08-22 23:59 IST → should be Aug 22 IST, not Aug 23
    const logs = [
      log("2026-08-22T18:29:00Z"), // 23:59 IST Aug 22
      log("2026-08-23T06:00:00Z"), // Aug 23 IST
    ];
    const result = calculateStreak("r1", logs, TODAY, TZ);
    expect(result.currentStreak).toBe(2);
    expect(result.lastCompletedDate).toBe("2026-08-23");
  });

  it("a log at 00:01 IST (18:31 UTC prev day) is on the correct IST date", () => {
    // 2026-08-22T18:31:00Z = 2026-08-23 00:01 IST → Aug 23 IST
    const logs = [
      log("2026-08-22T18:31:00Z"), // 00:01 IST Aug 23
    ];
    const result = calculateStreak("r1", logs, TODAY, TZ);
    expect(result.currentStreak).toBe(1);
    expect(result.lastCompletedDate).toBe("2026-08-23");
  });
});

// ---------------------------------------------------------------------------
// All-time longest streak with no current streak
// ---------------------------------------------------------------------------

describe("calculateStreak — historic long streak, no current streak", () => {
  it("currentStreak 0, longestStreak reflects history", () => {
    const logs = [
      log("2026-01-01T06:00:00Z"),
      log("2026-01-02T06:00:00Z"),
      log("2026-01-03T06:00:00Z"),
      log("2026-01-04T06:00:00Z"),
      log("2026-01-05T06:00:00Z"),
      log("2026-01-06T06:00:00Z"),
      log("2026-01-07T06:00:00Z"), // 7-day run, Jan 1–7
      // long gap
      log("2026-08-20T06:00:00Z"), // isolated, 3 days ago → streak broken
    ];
    const result = calculateStreak("r1", logs, TODAY, TZ);
    expect(result.currentStreak).toBe(0);
    expect(result.longestStreak).toBe(7);
    expect(result.lastCompletedDate).toBe("2026-08-20");
  });
});

// ---------------------------------------------------------------------------
// calculateReadingStreak — separate from calculateStreak (uses reading_sessions.date)
// ---------------------------------------------------------------------------

describe("calculateReadingStreak — separate streak from routine logs", () => {
  it("returns zeroes for no sessions", () => {
    const result = calculateReadingStreak([], TODAY, TZ);
    expect(result).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      lastCompletedDate: null,
    });
  });

  it("counts consecutive session days ending today", () => {
    const sessions = [
      { date: "2026-08-23" },
      { date: "2026-08-22" },
      { date: "2026-08-21" },
    ];
    const result = calculateReadingStreak(sessions, TODAY, TZ);
    expect(result.currentStreak).toBe(3);
    expect(result.longestStreak).toBe(3);
    expect(result.lastCompletedDate).toBe("2026-08-23");
  });

  it("ignores duplicate sessions on the same day", () => {
    const sessions = [
      { date: "2026-08-23" },
      { date: "2026-08-23" },
      { date: "2026-08-22" },
    ];
    const result = calculateReadingStreak(sessions, TODAY, TZ);
    expect(result.currentStreak).toBe(2);
  });

  it("breaks current streak when a day is missing, but keeps longest", () => {
    const sessions = [
      { date: "2026-08-23" },
      { date: "2026-08-21" },
      { date: "2026-08-20" },
      { date: "2026-08-19" },
    ];
    const result = calculateReadingStreak(sessions, TODAY, TZ);
    // 8-23 today, but 8-22 missing → current streak is just today
    expect(result.currentStreak).toBe(1);
    expect(result.longestStreak).toBe(3);
  });
});

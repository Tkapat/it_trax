/**
 * Unit tests for date utility functions (rollups.ts)
 */

import { describe, expect, it } from "vitest";
import {
  toLocalDateString,
  toLocalMonthString,
  toLocalYearString,
  groupByDay,
  groupByMonth,
  groupByYear,
  dailyStats,
  monthlyStats,
  yearlyStats,
  buildHeatmapData,
  dateRange,
} from "./rollups.js";

const TZ = "Asia/Kolkata";

// ---------------------------------------------------------------------------
// toLocalDateString
// ---------------------------------------------------------------------------

describe("toLocalDateString", () => {
  it("converts UTC to correct IST date — before midnight IST", () => {
    // 2026-08-22T18:00:00Z = 2026-08-22 23:30 IST — still Aug 22
    expect(toLocalDateString("2026-08-22T18:00:00Z", TZ)).toBe("2026-08-22");
  });

  it("converts UTC to correct IST date — after midnight IST", () => {
    // 2026-08-22T18:31:00Z = 2026-08-23 00:01 IST — now Aug 23
    expect(toLocalDateString("2026-08-22T18:31:00Z", TZ)).toBe("2026-08-23");
  });

  it("handles exactly midnight IST (18:30 UTC)", () => {
    // 2026-08-22T18:30:00Z = 2026-08-23 00:00 IST
    expect(toLocalDateString("2026-08-22T18:30:00Z", TZ)).toBe("2026-08-23");
  });
});

// ---------------------------------------------------------------------------
// toLocalMonthString
// ---------------------------------------------------------------------------

describe("toLocalMonthString", () => {
  it("returns YYYY-MM format", () => {
    expect(toLocalMonthString("2026-08-23T06:00:00Z", TZ)).toBe("2026-08");
  });

  it("rolls over month at UTC boundary correctly", () => {
    // 2026-07-31T18:31:00Z = 2026-08-01 00:01 IST
    expect(toLocalMonthString("2026-07-31T18:31:00Z", TZ)).toBe("2026-08");
  });

  it("pads single-digit months with zero", () => {
    expect(toLocalMonthString("2026-01-15T06:00:00Z", TZ)).toBe("2026-01");
  });
});

// ---------------------------------------------------------------------------
// toLocalYearString
// ---------------------------------------------------------------------------

describe("toLocalYearString", () => {
  it("returns YYYY format", () => {
    expect(toLocalYearString("2026-08-23T06:00:00Z", TZ)).toBe("2026");
  });

  it("rolls over year at IST new year boundary", () => {
    // 2025-12-31T18:31:00Z = 2026-01-01 00:01 IST
    expect(toLocalYearString("2025-12-31T18:31:00Z", TZ)).toBe("2026");
  });
});

// ---------------------------------------------------------------------------
// groupByDay
// ---------------------------------------------------------------------------

describe("groupByDay", () => {
  const items = [
    { completed_at: "2026-08-23T06:00:00Z", value: "a" },
    { completed_at: "2026-08-23T10:00:00Z", value: "b" },
    { completed_at: "2026-08-22T06:00:00Z", value: "c" },
  ];

  it("groups items by IST date", () => {
    const map = groupByDay(items, TZ);
    expect(map.size).toBe(2);
    expect(map.get("2026-08-23")).toHaveLength(2);
    expect(map.get("2026-08-22")).toHaveLength(1);
  });

  it("preserves original item references", () => {
    const map = groupByDay(items, TZ);
    expect(map.get("2026-08-23")?.[0]).toBe(items[0]);
  });
});

// ---------------------------------------------------------------------------
// groupByMonth
// ---------------------------------------------------------------------------

describe("groupByMonth", () => {
  const items = [
    { completed_at: "2026-08-01T06:00:00Z" },
    { completed_at: "2026-08-15T06:00:00Z" },
    { completed_at: "2026-07-20T06:00:00Z" },
  ];

  it("groups items by YYYY-MM", () => {
    const map = groupByMonth(items, TZ);
    expect(map.size).toBe(2);
    expect(map.get("2026-08")).toHaveLength(2);
    expect(map.get("2026-07")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// groupByYear
// ---------------------------------------------------------------------------

describe("groupByYear", () => {
  const items = [
    { completed_at: "2025-12-31T06:00:00Z" },
    { completed_at: "2026-01-01T06:00:00Z" },
    { completed_at: "2026-08-23T06:00:00Z" },
  ];

  it("groups items by YYYY", () => {
    const map = groupByYear(items, TZ);
    expect(map.size).toBe(2);
    expect(map.get("2025")).toHaveLength(1);
    expect(map.get("2026")).toHaveLength(2);
  });
});

// ---------------------------------------------------------------------------
// dailyStats
// ---------------------------------------------------------------------------

describe("dailyStats", () => {
  const logs = [
    { completed_at: "2026-08-21T06:00:00Z" },
    { completed_at: "2026-08-22T06:00:00Z" },
    { completed_at: "2026-08-22T10:00:00Z" }, // duplicate day
    { completed_at: "2026-08-23T06:00:00Z" },
  ];

  it("returns sorted DailyStat array", () => {
    const stats = dailyStats(logs, TZ);
    expect(stats).toEqual([
      { date: "2026-08-21", count: 1 },
      { date: "2026-08-22", count: 2 },
      { date: "2026-08-23", count: 1 },
    ]);
  });

  it("handles empty logs", () => {
    expect(dailyStats([], TZ)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// monthlyStats
// ---------------------------------------------------------------------------

describe("monthlyStats", () => {
  const logs = [
    { completed_at: "2026-07-10T06:00:00Z" },
    { completed_at: "2026-08-01T06:00:00Z" },
    { completed_at: "2026-08-15T06:00:00Z" },
  ];

  it("returns sorted MonthlyStat array", () => {
    const stats = monthlyStats(logs, TZ);
    expect(stats).toEqual([
      { month: "2026-07", count: 1 },
      { month: "2026-08", count: 2 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// yearlyStats
// ---------------------------------------------------------------------------

describe("yearlyStats", () => {
  const logs = [
    { completed_at: "2025-06-01T06:00:00Z" },
    { completed_at: "2026-01-01T06:00:00Z" },
    { completed_at: "2026-08-23T06:00:00Z" },
  ];

  it("returns sorted YearlyStat array", () => {
    const stats = yearlyStats(logs, TZ);
    expect(stats).toEqual([
      { year: "2025", count: 1 },
      { year: "2026", count: 2 },
    ]);
  });
});

// ---------------------------------------------------------------------------
// buildHeatmapData
// ---------------------------------------------------------------------------

describe("buildHeatmapData", () => {
  const logs = [
    { completed_at: "2026-08-22T06:00:00Z" },
    { completed_at: "2026-08-22T10:00:00Z" },
    { completed_at: "2026-08-23T06:00:00Z" },
  ];

  it("computes completionRatio correctly", () => {
    const data = buildHeatmapData(logs, 4, TZ);
    expect(data).toEqual([
      { date: "2026-08-22", completionCount: 2, completionRatio: 0.5 },
      { date: "2026-08-23", completionCount: 1, completionRatio: 0.25 },
    ]);
  });

  it("caps completionRatio at 1 when count exceeds totalActiveRoutines", () => {
    const data = buildHeatmapData(logs, 1, TZ);
    const aug22 = data.find((d) => d.date === "2026-08-22");
    expect(aug22?.completionRatio).toBe(1);
  });

  it("handles empty logs", () => {
    expect(buildHeatmapData([], 5, TZ)).toEqual([]);
  });

  it("avoids divide-by-zero when totalActiveRoutines is 0", () => {
    const data = buildHeatmapData(logs, 0, TZ);
    // safeTotal = max(0, 1) = 1
    const aug23 = data.find((d) => d.date === "2026-08-23");
    expect(aug23?.completionRatio).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// dateRange
// ---------------------------------------------------------------------------

describe("dateRange", () => {
  it("generates all dates between start and end inclusive", () => {
    expect(dateRange("2026-08-21", "2026-08-23")).toEqual([
      "2026-08-21",
      "2026-08-22",
      "2026-08-23",
    ]);
  });

  it("returns single date when start === end", () => {
    expect(dateRange("2026-08-23", "2026-08-23")).toEqual(["2026-08-23"]);
  });

  it("returns empty array when start is after end", () => {
    expect(dateRange("2026-08-25", "2026-08-23")).toEqual([]);
  });

  it("works across month boundaries", () => {
    const range = dateRange("2026-08-30", "2026-09-01");
    expect(range).toEqual(["2026-08-30", "2026-08-31", "2026-09-01"]);
  });
});

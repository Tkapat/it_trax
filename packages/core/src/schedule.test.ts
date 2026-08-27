import { describe, it, expect } from "vitest";
import { isScheduledOn, timeOfDayGreeting } from "./schedule.js";

// 2026-08-26 is a Wednesday (jsDay 3)
const WED = "2026-08-26";
const SUN = "2026-08-23";
const SAT = "2026-08-29";

describe("isScheduledOn", () => {
  it("daily is scheduled every day", () => {
    expect(isScheduledOn("daily", null, WED)).toBe(true);
    expect(isScheduledOn("daily", null, SUN)).toBe(true);
  });

  it("weekdays: Mon–Fri yes, Sat/Sun no", () => {
    expect(isScheduledOn("weekdays", null, WED)).toBe(true);
    expect(isScheduledOn("weekdays", null, SUN)).toBe(false);
    expect(isScheduledOn("weekdays", null, SAT)).toBe(false);
  });

  it("weekends: only Sat/Sun", () => {
    expect(isScheduledOn("weekends", null, WED)).toBe(false);
    expect(isScheduledOn("weekends", null, SAT)).toBe(true);
    expect(isScheduledOn("weekends", null, SUN)).toBe(true);
  });

  it("custom days use jsDay numbering (0=Sun)", () => {
    expect(isScheduledOn("custom", [0, 3], SUN)).toBe(true); // Sun
    expect(isScheduledOn("custom", [0, 3], WED)).toBe(true); // Wed
    expect(isScheduledOn("custom", [0, 3], SAT)).toBe(false); // Sat=6 not in [0,3]
    expect(isScheduledOn("custom", null, WED)).toBe(false); // no days = never
  });
});

describe("timeOfDayGreeting", () => {
  it("morning 5–11", () => {
    expect(timeOfDayGreeting(5)).toBe("morning");
    expect(timeOfDayGreeting(11)).toBe("morning");
  });
  it("afternoon 12–16", () => {
    expect(timeOfDayGreeting(12)).toBe("afternoon");
    expect(timeOfDayGreeting(16)).toBe("afternoon");
  });
  it("evening otherwise", () => {
    expect(timeOfDayGreeting(17)).toBe("evening");
    expect(timeOfDayGreeting(4)).toBe("evening");
  });
});
import { describe, it, expect } from "vitest";
import {
  computeMegaAvg,
  computeTaskProgress,
  computeProjectProgress,
  type TaskTreeNode,
} from "./progress.js";

describe("computeMegaAvg", () => {
  it("returns 0 when nothing is scheduled", () => {
    const r = computeMegaAvg({
      completedRoutinesToday: 0,
      totalScheduledRoutinesToday: 0,
      completedTodosDueToday: 0,
      totalTodosDueToday: 0,
    });
    expect(r.percent).toBe(0);
    expect(r.scheduledTotal).toBe(0);
  });

  it("computes a simple combined average", () => {
    // (2 routines + 1 todo) / (4 routines + 2 todos) = 3/6 = 50%
    const r = computeMegaAvg({
      completedRoutinesToday: 2,
      totalScheduledRoutinesToday: 4,
      completedTodosDueToday: 1,
      totalTodosDueToday: 2,
    });
    expect(r.percent).toBe(50);
  });

  it("rounds to nearest integer", () => {
    // 1/3 = 33.33 → 33
    const r = computeMegaAvg({
      completedRoutinesToday: 1,
      totalScheduledRoutinesToday: 3,
      completedTodosDueToday: 0,
      totalTodosDueToday: 0,
    });
    expect(r.percent).toBe(33);
  });

  it("caps totals at zero — negative inputs are clamped", () => {
    const r = computeMegaAvg({
      completedRoutinesToday: -5,
      totalScheduledRoutinesToday: -2,
      completedTodosDueToday: 0,
      totalTodosDueToday: 0,
    });
    expect(r.completedTotal).toBe(0);
    expect(r.scheduledTotal).toBe(0);
    expect(r.percent).toBe(0);
  });

  it("reaches 100% only when everything scheduled is complete", () => {
    const r = computeMegaAvg({
      completedRoutinesToday: 5,
      totalScheduledRoutinesToday: 5,
      completedTodosDueToday: 3,
      totalTodosDueToday: 3,
    });
    expect(r.percent).toBe(100);
  });

  it("handles todos-only day", () => {
    const r = computeMegaAvg({
      completedRoutinesToday: 0,
      totalScheduledRoutinesToday: 0,
      completedTodosDueToday: 2,
      totalTodosDueToday: 5,
    });
    expect(r.percent).toBe(40);
  });

  it("handles routines-only day", () => {
    const r = computeMegaAvg({
      completedRoutinesToday: 3,
      totalScheduledRoutinesToday: 8,
      completedTodosDueToday: 0,
      totalTodosDueToday: 0,
    });
    expect(r.percent).toBe(38); // 37.5 rounds to 38
  });
});

// ---------------------------------------------------------------------------
// Task tree helpers
// ---------------------------------------------------------------------------

const leaf = (id: string, done: boolean): TaskTreeNode => ({
  id,
  isCompleted: done,
  children: [],
});

describe("computeTaskProgress", () => {
  it("leaf completed = 100", () => {
    expect(computeTaskProgress(leaf("a", true))).toBe(100);
  });

  it("leaf incomplete = 0", () => {
    expect(computeTaskProgress(leaf("a", false))).toBe(0);
  });

  it("parent = average of children", () => {
    const parent: TaskTreeNode = {
      id: "p",
      isCompleted: false,
      children: [leaf("c1", true), leaf("c2", false), leaf("c3", false)],
    };
    expect(computeTaskProgress(parent)).toBe(33);
  });

  it("nested trees recurse — grandparent averages parents", () => {
    // childA = 100% (both leaves done), childB = 0% → parent = 50%
    const tree: TaskTreeNode = {
      id: "root",
      isCompleted: false,
      children: [
        {
          id: "childA",
          isCompleted: false,
          children: [leaf("a1", true), leaf("a2", true)],
        },
        {
          id: "childB",
          isCompleted: false,
          children: [leaf("b1", false), leaf("b2", false)],
        },
      ],
    };
    expect(computeTaskProgress(tree)).toBe(50);
  });

  it("parent's own is_completed is ignored when it has children", () => {
    const tree: TaskTreeNode = {
      id: "p",
      isCompleted: true, // ignored
      children: [leaf("c1", false), leaf("c2", false)],
    };
    expect(computeTaskProgress(tree)).toBe(0);
  });
});

describe("computeProjectProgress", () => {
  it("empty project = 0", () => {
    expect(computeProjectProgress([])).toBe(0);
  });

  it("roots averaged equally regardless of subtree size", () => {
    const big = { id: "big", isCompleted: false, children: [leaf("x", true), leaf("y", true), leaf("z", true)] }; // 100%
    const small = leaf("small", false); // 0%
    // Equal weight: (100 + 0) / 2 = 50 — NOT weighted by task count
    expect(computeProjectProgress([big, small])).toBe(50);
  });
});
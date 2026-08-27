/**
 * @trax/core — Mega average & task-tree progress
 *
 * Pure functions. No I/O.
 *
 * mega_avg = (completed routines today + completed todos due today)
 *          / (total scheduled routines today + total todos due today)
 *
 * Task-tree progress: parent % = average of children %;
 * leaf = its own is_completed as 0 | 100. Computed recursively.
 */

// ---------------------------------------------------------------------------
// Mega average
// ---------------------------------------------------------------------------

export interface MegaAvgInput {
  completedRoutinesToday: number;
  totalScheduledRoutinesToday: number;
  completedTodosDueToday: number;
  totalTodosDueToday: number;
}

export interface MegaAvgResult {
  /** 0–100 integer percentage */
  percent: number;
  completedTotal: number;
  scheduledTotal: number;
}

export function computeMegaAvg(input: MegaAvgInput): MegaAvgResult {
  const completedTotal =
    Math.max(0, input.completedRoutinesToday) +
    Math.max(0, input.completedTodosDueToday);
  const scheduledTotal =
    Math.max(0, input.totalScheduledRoutinesToday) +
    Math.max(0, input.totalTodosDueToday);

  if (scheduledTotal === 0) {
    return { percent: 0, completedTotal, scheduledTotal };
  }

  return {
    percent: Math.round((completedTotal / scheduledTotal) * 100),
    completedTotal,
    scheduledTotal,
  };
}

// ---------------------------------------------------------------------------
// Task-tree progress
// ---------------------------------------------------------------------------

export interface TaskTreeNode {
  id: string;
  isCompleted: boolean;
  children: TaskTreeNode[];
}

/** Progress for a single node in 0–100 */
export function computeTaskProgress(node: TaskTreeNode): number {
  // Leaf: own completion state only
  if (node.children.length === 0) {
    return node.isCompleted ? 100 : 0;
  }
  // Parent: average of children's progress
  const sum = node.children.reduce(
    (acc, child) => acc + computeTaskProgress(child),
    0
  );
  return Math.round(sum / node.children.length);
}

/** Overall project progress: roots averaged equally */
export function computeProjectProgress(roots: TaskTreeNode[]): number {
  if (roots.length === 0) return 0;
  const sum = roots.reduce((acc, root) => acc + computeTaskProgress(root), 0);
  return Math.round(sum / roots.length);
}
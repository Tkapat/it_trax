/**
 * @trax/core — Domain convenience types
 *
 * Built on top of the auto-generated database.ts (Supabase codegen).
 * Re-exports clean named aliases for the UI layer to consume.
 *
 * Import from "@trax/core" or "@trax/core/types".
 */

import type { Database } from "./database.js";

export type { Database } from "./database.js";
export type { Json } from "./database.js";

// ---------------------------------------------------------------------------
// Enum aliases (pulled from the generated Enums namespace)
// ---------------------------------------------------------------------------

export type RoutineFrequency = Database["public"]["Enums"]["routine_frequency"];
export type TaskPriority     = Database["public"]["Enums"]["task_priority"];
export type TaskStatus       = Database["public"]["Enums"]["task_status"];
export type ProjectStatus    = Database["public"]["Enums"]["project_status"];
export type TaskAction       = Database["public"]["Enums"]["task_action"];

// ---------------------------------------------------------------------------
// Row type aliases — what you get back from SELECT
// ---------------------------------------------------------------------------

export type Profile       = Database["public"]["Tables"]["profiles"]["Row"];
export type Routine       = Database["public"]["Tables"]["routines"]["Row"];
export type RoutineLog    = Database["public"]["Tables"]["routine_logs"]["Row"];
export type Task          = Database["public"]["Tables"]["tasks"]["Row"];
export type TaskLog       = Database["public"]["Tables"]["task_logs"]["Row"];
export type Streak        = Database["public"]["Tables"]["streaks"]["Row"];
export type Project       = Database["public"]["Tables"]["projects"]["Row"];
export type ProjectUpdate = Database["public"]["Tables"]["project_updates"]["Row"];
export type ProjectMedia  = Database["public"]["Tables"]["project_media"]["Row"];

// ---------------------------------------------------------------------------
// Insert type aliases — what you pass to INSERT
// ---------------------------------------------------------------------------

export type ProfileInsert       = Database["public"]["Tables"]["profiles"]["Insert"];
export type RoutineInsert       = Database["public"]["Tables"]["routines"]["Insert"];
export type RoutineLogInsert    = Database["public"]["Tables"]["routine_logs"]["Insert"];
export type TaskInsert          = Database["public"]["Tables"]["tasks"]["Insert"];
export type TaskLogInsert       = Database["public"]["Tables"]["task_logs"]["Insert"];
export type StreakInsert        = Database["public"]["Tables"]["streaks"]["Insert"];
export type ProjectInsert       = Database["public"]["Tables"]["projects"]["Insert"];
export type ProjectUpdateInsert = Database["public"]["Tables"]["project_updates"]["Insert"];
export type ProjectMediaInsert  = Database["public"]["Tables"]["project_media"]["Insert"];

// ---------------------------------------------------------------------------
// Update type aliases — what you pass to UPDATE (all fields optional)
// ---------------------------------------------------------------------------

export type ProfileUpdate       = Database["public"]["Tables"]["profiles"]["Update"];
export type RoutineUpdate       = Database["public"]["Tables"]["routines"]["Update"];
export type RoutineLogUpdate    = Database["public"]["Tables"]["routine_logs"]["Update"];
export type TaskUpdate          = Database["public"]["Tables"]["tasks"]["Update"];
export type TaskLogUpdate       = Database["public"]["Tables"]["task_logs"]["Update"];
export type StreakUpdate        = Database["public"]["Tables"]["streaks"]["Update"];
export type ProjectRowUpdate    = Database["public"]["Tables"]["projects"]["Update"];
export type ProjectUpdateUpdate = Database["public"]["Tables"]["project_updates"]["Update"];
export type ProjectMediaUpdate  = Database["public"]["Tables"]["project_media"]["Update"];

// ---------------------------------------------------------------------------
// Generic table-key utilities
// ---------------------------------------------------------------------------

type PublicTables = Database["public"]["Tables"];

/** Extract the Row type for a given table name */
export type TableRow<T extends keyof PublicTables> = PublicTables[T]["Row"];

/** Extract the Insert type for a given table name */
export type TableInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];

/** Extract the Update type for a given table name */
export type TableUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

// ---------------------------------------------------------------------------
// Heatmap view row (from generated Views section)
// ---------------------------------------------------------------------------

export type RoutineHeatmapRow =
  Database["public"]["Views"]["routine_heatmap"]["Row"];

// ---------------------------------------------------------------------------
// RPC return types
// ---------------------------------------------------------------------------

export type GetHeatmapRangeRow =
  Database["public"]["Functions"]["get_heatmap_range"]["Returns"][number];

export type GetTodayRoutineRow =
  Database["public"]["Functions"]["get_today_routines"]["Returns"][number];

// ---------------------------------------------------------------------------
// Composite / UI-layer types
// ---------------------------------------------------------------------------

/** A routine enriched with its current streak data — used on the home screen. */
export type RoutineWithStreak = {
  routine: Routine;
  streak: Streak | null;
};

/** A day's summary for the calendar heatmap view */
export type HeatmapDay = {
  /** ISO date string YYYY-MM-DD in the user's timezone */
  date: string;
  completionCount: number;
  /** 0–1 ratio based on the number of active routines for that day */
  completionRatio: number;
};

/** A task enriched with its most-recent log entry */
export type TaskWithLatestLog = {
  task: Task;
  latestLog: TaskLog | null;
};

/** A project with its update count and latest update timestamp */
export type ProjectSummary = {
  project: Project;
  updateCount: number;
  latestUpdateAt: string | null;
};

/** A project update with its associated media attachments */
export type ProjectUpdateWithMedia = {
  update: ProjectUpdate;
  media: ProjectMedia[];
};

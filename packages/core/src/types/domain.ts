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
export type ProjectStatus    = 'in_progress' | 'on_track' | 'at_risk' | 'completed';
export type ProjectIcon      =
  | 'code'
  | 'book'
  | 'target'
  | 'graduation-cap'
  | 'folder'
  | 'briefcase'
  | 'shopping-cart'
  | 'heart'
  | 'lightbulb'
  | 'pen';
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

// --- v2 tables (migration 0004/0005) ---
export type RoutineCategory  = Database["public"]["Tables"]["routine_categories"]["Row"];
export type ProjectCategory  = Database["public"]["Tables"]["project_categories"]["Row"];
export type Book             = Database["public"]["Tables"]["books"]["Row"];
export type ReadingSession   = Database["public"]["Tables"]["reading_sessions"]["Row"];
export type BookHighlight    = Database["public"]["Tables"]["book_highlights"]["Row"];
export type BookNote         = Database["public"]["Tables"]["book_notes"]["Row"];
export type ProjectTask      = Database["public"]["Tables"]["project_tasks"]["Row"];
export type TaskMedia        = Database["public"]["Tables"]["task_media"]["Row"];
export type ProjectLink      = Database["public"]["Tables"]["project_links"]["Row"];
export type Todo             = Database["public"]["Tables"]["todos"]["Row"];
export type Reminder         = Database["public"]["Tables"]["reminders"]["Row"];

// --- GitHub integration (migration 0013/0014) ---
export type GithubConnection = Database["public"]["Tables"]["github_connections"]["Row"];

// ---------------------------------------------------------------------------
// GitHub API types (not in DB — used by utils/githubApi.ts)
// ---------------------------------------------------------------------------

/** A GitHub repo as returned by GET /user/repos */
export type GithubRepo = {
  id: number;
  full_name: string;          // "owner/repo"
  name: string;
  owner: { login: string; avatar_url: string };
  description: string | null;
  private: boolean;
  default_branch: string;
  pushed_at: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
};

/** A file/directory entry from GET /repos/{owner}/{repo}/contents/{path} */
export type GithubTreeEntry = {
  name: string;
  path: string;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  size: number;
  sha: string;
  url: string;
  download_url: string | null;
};

/** A file's content response from GET /repos/{owner}/{repo}/contents/{path} */
export type GithubFileContent = {
  name: string;
  path: string;
  size: number;
  encoding: 'base64';
  content: string;            // base64-encoded file content
  sha: string;
};

/** GitHub contribution day from the GraphQL contributionsByDate */
export type GithubContributionDay = {
  date: string;               // "YYYY-MM-DD"
  contributionCount: number;
};

/** Connection info returned by get_github_connection_info() RPC */
export type GithubConnectionInfo = Database["public"]["Functions"]["get_github_connection_info"]["Returns"][number];

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

// --- v2 inserts ---
export type RoutineCategoryInsert  = Database["public"]["Tables"]["routine_categories"]["Insert"];
export type ProjectCategoryInsert  = Database["public"]["Tables"]["project_categories"]["Insert"];
export type BookInsert             = Database["public"]["Tables"]["books"]["Insert"];
export type ReadingSessionInsert   = Database["public"]["Tables"]["reading_sessions"]["Insert"];
export type BookHighlightInsert    = Database["public"]["Tables"]["book_highlights"]["Insert"];
export type BookNoteInsert         = Database["public"]["Tables"]["book_notes"]["Insert"];
export type ProjectTaskInsert      = Database["public"]["Tables"]["project_tasks"]["Insert"];
export type TaskMediaInsert        = Database["public"]["Tables"]["task_media"]["Insert"];
export type ProjectLinkInsert      = Database["public"]["Tables"]["project_links"]["Insert"];
export type TodoInsert             = Database["public"]["Tables"]["todos"]["Insert"];
export type ReminderInsert         = Database["public"]["Tables"]["reminders"]["Insert"];

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
export type ProjectLinkUpdate   = Database["public"]["Tables"]["project_links"]["Update"];
export type ProjectUpdateUpdate = Database["public"]["Tables"]["project_updates"]["Update"];
export type ProjectMediaUpdate  = Database["public"]["Tables"]["project_media"]["Update"];
export type BookUpdate          = Database["public"]["Tables"]["books"]["Update"];
export type ReadingSessionUpdate = Database["public"]["Tables"]["reading_sessions"]["Update"];
export type BookHighlightUpdate  = Database["public"]["Tables"]["book_highlights"]["Update"];
export type BookNoteUpdate       = Database["public"]["Tables"]["book_notes"]["Update"];

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

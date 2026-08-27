/**
 * @trax/core — Public API barrel
 *
 * Import from "@trax/core" to get the full public surface, or use
 * sub-path imports for tree-shaking:
 *   "@trax/core/supabase"
 *   "@trax/core/types"
 *   "@trax/core/streak"
 *   "@trax/core/dates"
 */

// Supabase client factory
export {
  createSupabaseClient,
  type TypedSupabaseClient,
  type SupabaseClient,
  type Session,
  type User,
  type AuthError,
} from "./supabase/client.js";

// Database types
export type { Database } from "./types/database.js";
// Domain convenience types
export type {
  RoutineFrequency,
  TaskPriority,
  TaskStatus,
  ProjectStatus,
  TaskAction,
  Profile,
  Routine,
  RoutineLog,
  Task,
  TaskLog,
  Streak,
  Project,
  ProjectUpdate,
  ProjectMedia,
  ProfileInsert,
  RoutineInsert,
  RoutineLogInsert,
  TaskInsert,
  TaskLogInsert,
  StreakInsert,
  ProjectInsert,
  ProjectUpdateInsert,
  ProjectMediaInsert,
  ProfileUpdate,
  RoutineUpdate,
  RoutineLogUpdate,
  TaskUpdate,
  StreakUpdate,
  ProjectRowUpdate,
  ProjectUpdateUpdate,
  ProjectLinkUpdate,
  TableRow,
  TableInsert,
  TableUpdate,
  RoutineWithStreak,
  HeatmapDay,
  TaskWithLatestLog,
  ProjectSummary,
  GetTodayRoutineRow,
  // v2 tables
  RoutineCategory,
  ProjectCategory,
  Book,
  ReadingSession,
  BookHighlight,
  ProjectTask,
  TaskMedia,
  ProjectLink,
  Todo,
  Reminder,
  RoutineCategoryInsert,
  ProjectCategoryInsert,
  BookInsert,
  ReadingSessionInsert,
  BookHighlightInsert,
  ProjectTaskInsert,
  TaskMediaInsert,
  ProjectLinkInsert,
  TodoInsert,
  ReminderInsert,
} from "./types/domain.js";

// Streak calculation
export { calculateStreak, type StreakResult } from "./streak/calculate.js";

// Scheduling helpers
export { isScheduledOn, timeOfDayGreeting } from "./schedule.js";

// Mega average & task-tree progress
export {
  computeMegaAvg,
  computeTaskProgress,
  computeProjectProgress,
  type MegaAvgInput,
  type MegaAvgResult,
  type TaskTreeNode,
} from "./stats/progress.js";

// Design tokens (shared between desktop & mobile)
export {
  Colors,
  Accent,
  PriorityColors,
  Radius,
  Motion,
  SpringConfig,
  FontSizes,
  type ThemeMode,
  type ThemeTokens,
} from "./theme.js";

// Date utilities
export {
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
  startOfMonth,
  todayInTimezone,
  yesterdayInTimezone,
  dayStartInstant,
  dayEndInstant,
  dayNoonInstant,
  type DailyStat,
  type MonthlyStat,
  type YearlyStat,
  type HeatmapDataPoint,
} from "./dates/rollups.js";

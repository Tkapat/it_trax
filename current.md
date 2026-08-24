# trax — Current Implementation Status

**Last Updated**: August 23, 2026

---

## ✅ Fully Working (Verified)

### Core Infrastructure (packages/core)
- **Supabase client factory** — `createSupabaseClient()` with env-based config, works in both web and React Native
- **TypeScript types** — All tables (profiles, routines, routine_logs, tasks, task_logs, streaks, projects, project_updates, project_media) + enums + RPC return types
- **Streak calculation** — Pure function `calculateStreak(routineId, logs, today?, timezone?)` with Asia/Kolkata timezone awareness using Temporal API
- **Date utilities** — `toLocalDateString`, `groupByDay/Month/Year`, `dailyStats/monthlyStats/yearlyStats`, `buildHeatmapData`, `dateRange`, `todayInTimezone`
- **Unit tests** — 34 tests passing (streak calc + date rollups)

### Supabase Schema
- **Migration 0001** — All 9 tables with proper indexes, constraints, and RLS policies (`auth.uid() = user_id`)
- **Migration 0002** — Automatic streak recalculation trigger on `routine_logs` insert/delete
- `routine_heatmap` view + `get_heatmap_range` / `get_today_routines` RPC functions
- `project-media` storage bucket with RLS policies

### Desktop App (apps/desktop) — Tauri + React + Vite
| Feature | Status |
|---------|--------|
| **Auth session persistence** | ✅ **FIXED** — Uses `@tauri-apps/plugin-store` for persistent auth storage in Tauri webview |
| Auth screens (Login, Signup, Forgot Password) | ✅ Working |
| Auth state management (race-condition-free) | ✅ Working |
| Error Boundary | ✅ Working |
| Home page — Today's routines with circular progress rings | ✅ Working (data fetches after login) |
| Home page — Tap routine to toggle completion | ✅ Working (invalidates queries, streak trigger updates DB) |
| Home page — Streak display per routine | ✅ Working (reads from auto-updated `streaks` table) |
| **Routine CRUD (Create/Edit/Delete)** | ✅ **NEW** — Full modal with frequency, time, custom days |
| Calendar page — Monthly heatmap grid | ✅ Working |
| Calendar page — Month navigation | ✅ Working |
| Projects page — List with grid layout | ✅ Working |
| Projects page — Create/Edit/Delete modals | ✅ Working |
| Project Detail page — Header, GitHub link, UpdateFeed, Media upload | ✅ Working |
| **Tasks page — List, filter, Create/Edit/Delete** | ✅ **NEW** — Full CRUD with status, priority, due date, project linking |
| Task status toggle (click to advance) | ✅ Working |
| Responsive dark theme (Inter font, cyan accent) | ✅ Working |
| Framer Motion animations | ✅ Working |
| ESLint + TypeScript strict mode | ✅ Passing |

---

## 📋 Partially Complete / Pending

### Streak Recalculation
- **Migration 0002 created** — Postgres trigger on `routine_logs` insert/delete that calls `recalculate_streak()` and upserts `streaks` table
- **Needs**: Apply migration to Supabase (`supabase db push` or run SQL in dashboard)

### Mobile App (apps/mobile) — Expo + React Native
| Feature | Status |
|---------|--------|
| Auth screens (Login, Signup, Forgot Password) | ✅ Code complete, **UNVERIFIED** (never run on device/emulator) |
| Auth state + AsyncStorage persistence | ✅ Code correct (uses AsyncStorage) |
| Home screen — Today's routines with progress rings | ✅ Code complete, **UNVERIFIED** |
| Calendar screen — Heatmap grid | ✅ Code complete, **UNVERIFIED** |
| Tasks screen — List, filter, Create/Edit/Delete | ✅ Code complete, **UNVERIFIED** |
| Bottom tab navigation (Today / Calendar / Tasks) | ✅ Code complete, **UNVERIFIED** |
| Expo Notifications setup (morning + evening escalation) | ✅ Code complete, **UNVERIFIED** |
| Reanimated 3 ProgressRing component | ✅ Code complete, **UNVERIFIED** |

### Removed / Not Implemented on Mobile
| Feature | Status |
|---------|--------|
| Mobile Projects section | ❌ **REMOVED** — TypeScript issues with React Native bridge; desktop has full implementation |
| Mobile Project Detail | ❌ **REMOVED** — Same issues |

### Tasks UI (Both Platforms)
| Feature | Status |
|---------|--------|
| Desktop Tasks UI | ✅ Complete |
| Mobile Tasks UI | ✅ Code complete, **UNVERIFIED** |

---

## 🔧 Technical Debt / Known Issues

1. **Streak migration not applied** — User must run `supabase db push` or execute `supabase/migrations/0002_streak_trigger.sql` in Supabase dashboard
2. **Mobile app never tested on device** — All mobile claims are "code compiles" only
3. **Mobile Projects section removed** — React Native / Web type system differences make it hard to share ProjectForm component; desktop has full implementation
4. **No Profile/Settings page** — Username, avatar, timezone editing missing
5. **No keyboard shortcuts** — Desktop power-user features missing
5. **No CI/CD** — GitHub Actions needed for lint, typecheck, test, build

---

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Apply streak migration to Supabase (run once)
supabase db push
# OR run supabase/migrations/0002_streak_trigger.sql in Supabase SQL editor

# Start desktop dev (Tauri + Vite)
cd apps/desktop && pnpm tauri dev

# Or web-only
cd apps/desktop && pnpm web:dev  # http://localhost:1420

# Start mobile (Expo)
cd apps/mobile && pnpm start

# Run checks
pnpm check-types
pnpm lint
pnpm test  # (in packages/core)
```

---

## 📁 Key File Locations

| Area | Path |
|------|------|
| Core types/logic | `packages/core/src/` |
| Supabase migrations | `supabase/migrations/` (0001_initial_schema.sql, 0002_streak_trigger.sql) |
| Desktop pages | `apps/desktop/src/pages/` (Home, Calendar, Projects, ProjectDetail, Tasks, Auth) |
| Desktop components | `apps/desktop/src/components/` (RoutineForm, TaskForm, ProjectForm, UpdateFeed, etc.) |
| Desktop hooks | `apps/desktop/src/hooks/` (useSupabase with Tauri store) |
| Mobile screens | `apps/mobile/src/screens/` (Home, Calendar, Tasks) |
| Mobile components | `apps/mobile/src/components/` (TaskForm, RoutineForm, etc.) |
| Mobile navigation | `apps/mobile/src/navigation/` |
| Mobile hooks | `apps/mobile/src/hooks/` |
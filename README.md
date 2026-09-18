# Trax

A personal-life operating system: **routines, calendar, projects, books and todos**
in one app, wrapped in a brutalist, neubrutalist design language. Built as a
pnpm + Turborepo monorepo around a single, strict UI design system defined once
in `@trax/core`.

## Repo layout

| Path | What it is |
| --- | --- |
| `apps/mobile` | Expo (React Native) app — the primary product. SDK 57, RN 0.86, React 19.2. Own git repo (submodule, see below). |
| `apps/desktop` | Tauri + Vite desktop shell. |
| `packages/core` | `@trax/core` — the **single source of truth**: UI design tokens (palette, accent themes, radii, font sizes), domain types, plus pure logic (dates, schedules, streaks, stats) with Vitest tests, and the Supabase client. |
| `packages/ui` | `@trax/ui` — cross-app shared components (card, button, tokens, native/web aliases). |
| `packages/eslint-config` · `packages/typescript-config` | Shared lint / TS configs. |

## Design system

Everything derives from `@trax/core` tokens; the mobile theme (`apps/mobile/src/theme`)
re-exports them (see `src/theme/index.ts`). No per-screen border/shadow values are allowed.

- **Palette** — flat brutalist tokens per mode via `Colors` per mode (dark / light). Borders are
  structural (fixed per mode, never accent-tinted). Depth comes from a **solid accent
  shadow**, applied by components, never stored as a color.
  - dark: `bgBase #141414` · `bgElevated #1C1C1C` · `border #F5F5F5`
  - light: `bgBase #FAFAF7` · `bgElevated #FFFFFF` · `border #111111`
- **Accent themes** — an independent axis from dark/light mode: `volt`, `signal-orange`,
  `crimson`, `cobalt`, `violet`, `magenta`, `teal`. `OnAccentText` picks black/white text
  per accent (only cobalt needs white). Depends on Android `accent_theme` via expo-build-properties.
- **Scales** — spacing `4/8/12/16/24/32/40` (`Spacing.sm2` is the 12px step); radii:
  `control 12` · `card 16` · `pill 999`. Type scale `12/14/16/20/28/36`, JetBrains Mono;
  quantities use tabular numerals (`Typography.num`).
- **The Card is the ONLY card language.** `Card` renders `primary` (border + solid accent
  block shadow at offset `(4,4)`, reserved *inside* the layout footprint via 4px padding —
  shadows can never fuse or clip), `secondary` (border only), `tertiary` (plain fill).
  Pressing sinks the face 4px.
- **Shared primitives** (`apps/mobile/src/components/ui`): `Card`, `Button`, `Input`,
  `Checkbox`, `SegmentedControl`, `StatRow` (interleaves vertical dividers, optional top
  rule via `separated`), `Divider`, `Badge`, `StickyNoteCard`, `Sparkle`.
- **Alignment is enforced, not eyeballed.** The 7-point checklist applied to every screen:
  1. **shadow-clip** — depth shadows live inside the Card footprint
  2. **truncation** — single-line text `numberOfLines={1}`, never wraps mid-chip
  3. **fusion** — vertical rhythm keeps adjacent cards/dividers from fusing
  4. **strays** — every card, tile and chip is a shared primitive; no orphan borders
  5. **spacing** — gaps come from the `Spacing` scale, not magic numbers
  6. **rotation** — text stays horizontal; no 90°/180°-rotated labels
  7. **grid-clip** — grid rows/scenes must fit the narrowest supported width
- **Restraint rules** (current conventions): tree rows are **border-only at every depth**
  (no depth shadow on nested lists); project/task surfaces are **neutral** (`bgElevated`) —
  accent is a signal (progress, selection, data), never a wash.

## Screen migration status

All migration converts screens off legacy style objects / `ClaySurface` (soft shadow +
per-screen borders) onto the tiered `Card` + shared primitives above.

| Area | Screen(s) | Status |
| --- | --- | --- |
| Routine / Home | `HomeScreen` | ✅ Migrated |
| Calendar | `CalendarScreen` | ✅ Migrated |
| Projects (list) | `ProjectsScreen` | ✅ Migrated |
| Project detail | `ProjectDetailScreen` | ✅ Migrated |
| To Do | `TasksScreen` | ⏳ Pending |
| Profile + settings | `ProfileScreen`, `settings/*` | ⏳ Pending |
| Book detail | `BookDetailScreen` | ⏳ Pending |
| Legacy harness | `ClaySurface`, `MorphCheckbox`, `BookEntry`, `RoutineForm`, `TaskForm`, `MainTabs` | Retired as the last consumer migrates |

Remaining `ClaySurface` consumers: `TasksScreen`, `ProfileScreen`, `BookDetailScreen`,
`settings/*`, `MainTabs`. Auth screens (`LoginScreen`, `SignupScreen`,
`ForgotPasswordScreen`) use the legacy `../components` Button/Input and are out of the
migration scope.

## Getting started

Node >= 18, pnpm >= 9 and Turbo are required.

```sh
pnpm install           # install at the workspace root
pnpm build             # build all apps/packages (turbo)
pnpm check-types       # tsc --noEmit across the repo
```

### Mobile

```sh
cd apps/mobile
npx expo start         # dev server (or pnpm --filter=@trax/mobile start)
npx expo run:android   # or :ios
```

**Validation before committing mobile changes** (from `apps/mobile`):

```sh
npx tsc --noEmit                       # types
npx eslint src/<changed files>         # lint (baseline: HomeScreen ~0 errors)
npx expo export --platform android     # bundler smoke test → "Exported: dist"
```

### Desktop

```sh
pnpm --filter=desktop dev              # tauri dev (Vite for the web shell)
```

### Core tests

```sh
pnpm --filter=@trax/core test          # vitest
```

## Repository notes

- **`apps/mobile` is its own git repository** (tracked as a submodule gitlink, no
  `.gitmodules` file). Workflow: commit inside `apps/mobile` first, then from the repo
  root `git add apps/mobile && git commit` to bump the pointer.
  - ⚠️ `apps/mobile/src/components/ProgressRing.tsx` holds an uncommitted WIP experiment
    (a `top`-offset/scale hack). Do not sweep it into commits with `git add -A` — stage
    explicit files only.
- Fonts load behind a gate in `App.tsx` (`useFonts`) — screens mount post-load, no FOUT.
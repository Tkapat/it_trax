/**
 * @trax/core — Strict UI Design System tokens
 *
 * THE single source of truth. Desktop CSS variables and mobile theme
 * objects MUST derive from these values. No other colors allowed.
 */

// ---------------------------------------------------------------------------
// Palette — flat brutalist tokens (no hue-shifted bases, no blur shadows)
// ---------------------------------------------------------------------------

/** Neutral palette — flat values per mode. Borders are structural
 *  (fixed per mode, never accent-tinted); depth comes from the solid
 *  accent shadow, which is applied by components, not stored here. */
export const Colors = {
  dark: {
    bgBase: '#141414',
    bgElevated: '#1C1C1C',
    border: '#F5F5F5',
    textPrimary: '#F5F5F5',
    textSecondary: '#A0A0A0',
  },
  light: {
    bgBase: '#FAFAF7',
    bgElevated: '#FFFFFF',
    border: '#111111',
    textPrimary: '#111111',
    textSecondary: '#6B6B6B',
  },
} as const;

/** Accent theme names — independent axis from dark/light mode. */
export type AccentName =
  | 'volt'
  | 'signal-orange'
  | 'crimson'
  | 'cobalt'
  | 'violet'
  | 'magenta'
  | 'teal';

export const AccentThemes: Record<AccentName, { accent: string; accentDim: string }> = {
  volt:          { accent: '#D7FF3F', accentDim: '#D7FF3F33' },
  'signal-orange': { accent: '#FF5C1A', accentDim: '#FF5C1A33' },
  crimson:       { accent: '#E8384F', accentDim: '#E8384F33' },
  cobalt:        { accent: '#2F5FE0', accentDim: '#2F5FE033' },
  violet:        { accent: '#8B5CF6', accentDim: '#8B5CF633' },
  magenta:       { accent: '#FF3D81', accentDim: '#FF3D8133' },
  teal:          { accent: '#00A8B5', accentDim: '#00A8B533' },
} as const;

/** Text color to use ON a solid accent fill, per accent (luminance-based:
 *  only cobalt is dark enough to need white text). */
export const OnAccentText: Record<AccentName, '#000000' | '#FFFFFF'> = {
  volt: '#000000',
  'signal-orange': '#000000',
  crimson: '#000000',
  cobalt: '#FFFFFF',
  violet: '#000000',
  magenta: '#000000',
  teal: '#000000',
} as const;

/** Default accent theme. */
export const Accent: { accent: string; accentDim: string; theme: AccentName; themes: typeof AccentThemes } = {
  accent: '#D7FF3F',
  accentDim: '#D7FF3F33',
  theme: 'volt',
  themes: AccentThemes,
} as const;

/** Priority dots (To Do tab only) — small, never fill an element */
export const PriorityColors = {
  high: '#E8384F',
  med: '#D7FF3F', // reuses default accent (volt)
  low: '#6B6B6B', // grey, not a color
} as const;

/** Resolve accent colors for a given theme name. */
export function getAccentColors(name: AccentName) { return AccentThemes[name]; }


export type ThemeMode = "dark" | "light";

export type ThemeTokens = typeof Colors.dark;

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

export const Radius = {
  card: 16, // brutalist cards
  control: 12, // buttons, inputs, icon tiles
  pill: 999,
} as const;

// ---------------------------------------------------------------------------
// Typography scale — 12/14/16/20/28/36 only
// ---------------------------------------------------------------------------

export const FontSizes = {
  caption: 12,
  body: 14,
  bodyLg: 16,
  title: 20,
  h2: 28,
  h1: 36,
} as const;

// ---------------------------------------------------------------------------
// Motion — spring only, never linear/ease
// ---------------------------------------------------------------------------

/** Framer Motion config (desktop) */
export const Motion = {
  spring: { type: "spring" as const, stiffness: 300, damping: 30 },
  ringFillDurationMs: 400,
} as const;

/** Reanimated/Animated equivalent (mobile) */
export const SpringConfig = {
  damping: 30,
  stiffness: 300,
} as const;
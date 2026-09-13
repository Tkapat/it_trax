/**
 * @trax/core — Strict UI Design System tokens
 *
 * THE single source of truth. Desktop CSS variables and mobile theme
 * objects MUST derive from these values. No other colors allowed.
 */

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

export const Colors = {
  dark: {
    bgBase: '#17150F', // warm near-black base
    bgElevated: '#211E17', // card surface
    bgElevated2: '#2A261D', // nested / pressed surface
    borderHairline: 'transparent',
    textPrimary: '#F5F2EC',
    textSecondary: '#A69C8C',
    textTertiary: '#6B6B6B',
    shadowLight: 'rgba(255,244,224,0.06)',
    shadowDark: 'rgba(0,0,0,0.75)',
  },
  light: {
    bgBase: '#F0F0F0',
    bgElevated: '#FAFAFA',
    bgElevated2: '#FFFFFF',
    borderHairline: 'transparent',
    textPrimary: '#000000',
    textSecondary: '#737373',
    textTertiary: '#A3A3A3',
    shadowLight: 'rgba(255,255,255,0.85)',
    shadowDark: 'rgba(0,0,0,0.10)',
  },
} as const;

/** Accent theme names — independent axis from dark/light mode. */
export type AccentName = 'amber' | 'crimson' | 'emerald' | 'sapphire' | 'violet' | 'rose' | 'cyan';

export const AccentThemes: Record<AccentName, { accent: string; accentDim: string }> = {
  amber:   { accent: '#FFB800', accentDim: '#FFB80033' },
  crimson: { accent: '#FF4545', accentDim: '#FF454533' },
  emerald: { accent: '#2ECC71', accentDim: '#2ECC7133' },
  sapphire:{ accent: '#3B82F6', accentDim: '#3B82F633' },
  violet:  { accent: '#A855F7', accentDim: '#A855F733' },
  rose:    { accent: '#FF6FA5', accentDim: '#FF6FA533' },
  cyan:    { accent: '#22D3EE', accentDim: '#22D3EE33' },
} as const;

/** Default accent theme. */
export const Accent: { accent: string; accentDim: string; theme: AccentName; themes: typeof AccentThemes } = {
  accent: '#FFB800',
  accentDim: '#FFB80033',
  theme: 'amber',
  themes: AccentThemes,
} as const;

/** Priority dots (To Do tab only) — small, never fill an element */
export const PriorityColors = {
  high: '#FF453A',
  med: '#FFB800', // reuses default accent
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
  card: 28, // clay cards
  control: 14, // buttons, inputs
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
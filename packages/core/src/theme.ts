/**
 * @trax/core — Strict UI Design System tokens
 *
 * THE single source of truth. Desktop CSS variables and mobile theme
 * objects MUST derive from these values. No other colors allowed.
 */

// ---------------------------------------------------------------------------
// Accent base colours — each accent gets a subtly hue-shifted near-black
// base for dark mode. Light mode stays neutral with barely-perceptible shifts.
// ---------------------------------------------------------------------------

export const AccentBaseColors: Record<AccentName, {
  darkBgBase: string;
}> = {
  amber:   { darkBgBase: '#17150F' }, // warm near-black, unchanged default
  crimson: { darkBgBase: '#1A1210' }, // warm red-tinted dark
  emerald: { darkBgBase: '#101A14' }, // cool green-tinted dark
  sapphire:{ darkBgBase: '#10141A' }, // cool blue-tinted dark
  violet:  { darkBgBase: '#16121A' }, // violet-tinted dark
  rose:    { darkBgBase: '#1A1216' }, // rose-tinted dark
  cyan:    { darkBgBase: '#0F181A' }, // cool cyan-tinted dark
};

/** Convert '#rrggbb' to {r,g,b}. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

/** Blend a hex colour toward `toward` (also hex) by `ratio` 0-1. */
function mix(hex: string, toward: string, ratio: number): string {
  const a = hexToRgb(hex);
  const b = hexToRgb(toward);
  const r = Math.round(a.r + (b.r - a.r) * ratio);
  const g = Math.round(a.g + (b.g - a.g) * ratio);
  const bb = Math.round(a.b + (b.b - a.b) * ratio);
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${bb.toString(16).padStart(2,'0')}`;
}

/** Derive the full dark palette from a base colour.
 *
 * bgBase is the accent base itself. bgElevated / bgElevated2 step toward
 * white by fixed ratios (matching the current warm-grey lightness steps).
 * shadowLight is a tint of the base at the same low opacity as amber's
 * current `rgba(255,244,224,0.06)`. shadowDark stays constant (it's a
 * cast shadow, not a surface). Text colours stay the current proven values.
 */
export function getAccentBasePalette(accentName: AccentName) {
  const base = AccentBaseColors[accentName]?.darkBgBase ?? AccentBaseColors.amber.darkBgBase;
  const bgElevated  = mix(base, '#FFFFFF', 0.07);
  const bgElevated2 = mix(base, '#FFFFFF', 0.14);
  const c = hexToRgb(base);
  const shadowLight = `rgba(${c.r},${c.g},${c.b},0.06)`;
  return {
    bgBase: base,
    bgElevated,
    bgElevated2,
    shadowLight,
    shadowDark: 'rgba(0,0,0,0.75)',
  };
}

// ---------------------------------------------------------------------------
// Accent-derived palettes (per-accent base with hue shift)
// ---------------------------------------------------------------------------

/** For light mode: apply a barely-perceptible hue shift by blending the
 *  accent base into the neutral light palette at a tiny ratio.
 *  Keeps light mode reading as neutral light grey. */
export function getAccentLightPalette(accentName: AccentName) {
  const base = AccentBaseColors[accentName]?.darkBgBase ?? AccentBaseColors.amber.darkBgBase;
  const bgBase      = mix('#F0F0F0', base, 0.03);
  const bgElevated  = mix('#FAFAFA', base, 0.03);
  const bgElevated2 = mix('#FFFFFF', base, 0.03);
  const c = hexToRgb(base);
  return {
    bgBase,
    bgElevated,
    bgElevated2,
    shadowLight: `rgba(${c.r},${c.g},${c.b},0.04)`,
    shadowDark: 'rgba(0,0,0,0.10)',
  };
}

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

/** Neutral palette — fallback when accent-derivation is not needed. */
export const Colors = {
  dark: {
    bgBase: '#17150F', // warm near-black base (default / amber)
    bgElevated: '#211E17',
    bgElevated2: '#2A261D',
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
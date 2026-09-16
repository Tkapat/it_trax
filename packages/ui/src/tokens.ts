/**
 * @repo/ui — Brutalist design tokens (single source for documentation;
 * live apps read @trax/core + their own theme layers — same values).
 *
 * Flat tokens, zero blur. Borders structural (fixed per mode);
 * shadow is the accent in dark mode, #111111 in light mode.
 */

// ---------------------------------------------------------------------------
// Font families — Martian Mono (wordmark ONLY), JetBrains Mono (everything)
// ---------------------------------------------------------------------------

export const Fonts = {
  wordmark: "'Martian Mono', monospace", // "trax" wordmark + dot, nowhere else
  body: "'JetBrains Mono', ui-monospace, monospace", // headers/body/labels/buttons/inputs/stats
} as const;

export const FontWeights = {
  regular: '400',
  medium: '500',
  bold: '700',
} as const;

// ---------------------------------------------------------------------------
// Shape — 16 cards, 12 controls, pill segments/nav
// ---------------------------------------------------------------------------

export const Radius = {
  card: 16,
  control: 12,
  pill: 999,
} as const;

export const Border = {
  width: { mobile: 2.5, desktop: 3 },
  style: 'solid',
} as const;

// ---------------------------------------------------------------------------
// Shadow — flat 4px offset, zero blur, zero spread.
// Resting offset; pressed collapses to zero + element translates (4,4).
// ---------------------------------------------------------------------------

export const Shadow = {
  resting: '4px 4px 0px var(--shadow)',
  pressed: '0px 0px 0px transparent',
} as const;

export const ShadowOffsets = {
  resting: { width: 4, height: 4 },
  pressed: { width: 0, height: 0 },
} as const;

export const ShadowTranslate = {
  pressed: { x: 4, y: 4 },
} as const;

// ---------------------------------------------------------------------------
// Color palette — flat brutalist values
// ---------------------------------------------------------------------------

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

export const AccentThemes = {
  volt: '#D7FF3F',
  'signal-orange': '#FF5C1A',
  crimson: '#E8384F',
  cobalt: '#2F5FE0',
  violet: '#8B5CF6',
  magenta: '#FF3D81',
  teal: '#00A8B5',
} as const;

export type AccentName = keyof typeof AccentThemes;

// ---------------------------------------------------------------------------
// Typography scale
// ---------------------------------------------------------------------------

export const FontSizes = {
  caption: 12,
  body: 14,
  bodyLg: 16,
  title: 20,
  h2: 28,
  h1: 36,
  num: 24,
  display: 32,
} as const;

/**
 * @repo/ui — Neubrutalism design tokens
 *
 * Shared between mobile (React Native) and desktop (React DOM).
 * Every app imports from here for font families, radii, borders, shadows.
 */

// ---------------------------------------------------------------------------
// Font families
// ---------------------------------------------------------------------------

export const Fonts = {
  display: "'Space Grotesk', sans-serif",   // headers, big numbers
  body: "'Inter', sans-serif",              // body / UI text (unchanged)
  mono: "'Space Mono', monospace",          // stats, dates, streaks
} as const;

export const FontWeights = {
  display: { medium: 500, semibold: 600, bold: 700 } as const,
  mono: { regular: 400, bold: 700 } as const,
} as const;

// ---------------------------------------------------------------------------
// Radius scale
// ---------------------------------------------------------------------------

export const Radius = {
  card: 14,       // primary cards (routine, project, overview)
  control: 10,    // buttons, inputs, pill-buttons
  badge: 8,       // badges, small chips, tags
  circle: 999,    // checkboxes, avatars, icon chips
} as const;

// ---------------------------------------------------------------------------
// Border
// ---------------------------------------------------------------------------

export const Border = {
  width: {
    mobile: 2,
    desktop: 2.5,
  },
  style: 'solid' as const,
  color: 'var(--border-color)',
} as const;

// ---------------------------------------------------------------------------
// Shadow — neubrutalism: hard offset, zero blur, zero spread
// ---------------------------------------------------------------------------

export const Shadow = {
  resting: '4px 4px 0px var(--accent)',
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
// Color palette
// ---------------------------------------------------------------------------

export const Colors = {
  dark: {
    bgBase: '#000000',
    bgElevated: '#0D0D0D',
    bgElevated2: '#161616',
    borderColor: '#FFFFFF',
    textPrimary: '#FFFFFF',
    textSecondary: '#9A9A9A',
  },
  light: {
    bgBase: '#FFFFFF',
    bgElevated: '#F7F7F7',
    bgElevated2: '#EFEFEF',
    borderColor: '#000000',
    textPrimary: '#000000',
    textSecondary: '#6B6B6B',
  },
} as const;

export const AccentThemes = {
  amber:   '#FFB800',
  crimson: '#FF4545',
  emerald: '#2ECC71',
  sapphire:'#3B82F6',
  violet:  '#A855F7',
  rose:    '#FF6FA5',
  cyan:    '#22D3EE',
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

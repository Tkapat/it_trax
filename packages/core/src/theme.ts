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
    bgBase: "#000000",
    bgElevated: "#0D0D0D",
    bgElevated2: "#161616",
    borderHairline: "#262626",
    textPrimary: "#FFFFFF",
    textSecondary: "#A3A3A3",
    textTertiary: "#6B6B6B",
  },
  light: {
    bgBase: "#FFFFFF",
    bgElevated: "#FAFAFA",
    bgElevated2: "#F0F0F0",
    borderHairline: "#E5E5E5",
    textPrimary: "#000000",
    textSecondary: "#737373",
    textTertiary: "#A3A3A3",
  },
} as const;

/** Accent — the ONLY saturated color. Progress rings, streaks, focus. */
export const Accent = {
  accent: "#FFB800",
  /** 20% opacity — ring tracks, subtle backgrounds */
  accentDim: "#FFB80033",
} as const;

/** Priority dots (To Do tab only) — small, never fill an element */
export const PriorityColors = {
  high: "#FF453A",
  med: "#FFB800", // reuses accent
  low: "#6B6B6B", // grey, not a color
} as const;

export type ThemeMode = "dark" | "light";

export type ThemeTokens = typeof Colors.dark;

// ---------------------------------------------------------------------------
// Shape
// ---------------------------------------------------------------------------

export const Radius = {
  card: 16,
  control: 12, // buttons, inputs
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
import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";
import type { AccentName } from "@trax/core";

export type ThemeMode = "dark" | "light";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
  accentTheme: AccentName;
  setAccentTheme: (name: AccentName) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function applyMode(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "light") {
    root.setAttribute("data-theme", "light");
  } else {
    root.removeAttribute("data-theme");
  }
}

function applyAccent(name: AccentName) {
  document.documentElement.setAttribute("data-accent", name);
}

function normalizeMode(value: string | null | undefined): ThemeMode {
  return value === "light" ? "light" : "dark";
}

function normalizeAccent(value: string | null | undefined): AccentName {
  const valid: AccentName[] = ['volt', 'signal-orange', 'crimson', 'cobalt', 'violet', 'magenta', 'teal'];
  if (value && (valid as string[]).includes(value)) return value as AccentName;
  const legacy: Record<string, AccentName> = {
    amber: 'signal-orange',
    emerald: 'teal',
    sapphire: 'cobalt',
    rose: 'magenta',
    cyan: 'teal',
  };
  return (value && legacy[value]) || 'volt';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [mode, setModeState] = useState<ThemeMode>("dark");
  const [accentTheme, setAccentThemeState] = useState<AccentName>('volt');

  useEffect(() => { applyMode(mode); }, [mode]);
  useEffect(() => { applyAccent(accentTheme); }, [accentTheme]);

  useEffect(() => {
    let active = true;
    const applyUserTheme = async () => {
      if (!user) {
        if (active) { setModeState("dark"); setAccentThemeState('volt'); }
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("theme, accent_theme")
        .eq("id", user.id)
        .single();
      if (!active) return;
      if (!error && data) {
        setModeState(normalizeMode(data.theme));
        setAccentThemeState(normalizeAccent(data.accent_theme));
      } else {
        setModeState("dark");
        setAccentThemeState('volt');
      }
    };
    applyUserTheme();
    return () => { active = false; };
  }, [user, supabase]);

  const setMode = useCallback(
    async (next: ThemeMode) => {
      setModeState(next);
      if (!user) return;
      await supabase.from("profiles").update({ theme: next }).eq("id", user.id);
    },
    [user, supabase]
  );

  const setAccentTheme = useCallback(
    async (next: AccentName) => {
      setAccentThemeState(next);
      if (!user) return;
      await supabase.from("profiles").update({ accent_theme: next }).eq("id", user.id);
    },
    [user, supabase]
  );

  const value = useMemo(() => ({ mode, setMode, accentTheme, setAccentTheme }), [mode, setMode, accentTheme, setAccentTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

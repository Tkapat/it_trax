import React, { createContext, useContext, useCallback, useEffect, useMemo, useState } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { useAuth } from "../hooks/useAuth";

export type ThemeMode = "dark" | "light";

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => Promise<void>;
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

function normalizeMode(value: string | null | undefined): ThemeMode {
  return value === "light" ? "light" : "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const supabase = useSupabase();
  const { user } = useAuth();
  const [mode, setModeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    applyMode(mode);
  }, [mode]);

  useEffect(() => {
    let active = true;
    const applyUserTheme = async () => {
      if (!user) {
        if (active) setModeState("dark");
        return;
      }
      const { data, error } = await supabase
        .from("profiles")
        .select("theme")
        .eq("id", user.id)
        .single();
      if (!active) return;
      if (!error && data) {
        setModeState(normalizeMode(data.theme));
      } else {
        setModeState("dark");
      }
    };
    applyUserTheme();
    return () => {
      active = false;
    };
  }, [user, supabase]);

  const setMode = useCallback(
    async (next: ThemeMode) => {
      setModeState(next);
      if (!user) return;
      await supabase.from("profiles").update({ theme: next }).eq("id", user.id);
    },
    [user, supabase]
  );

  const value = useMemo(() => ({ mode, setMode }), [mode, setMode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

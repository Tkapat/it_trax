import { createContext, useContext, useMemo } from "react";
import { createSupabaseClient, type TypedSupabaseClient } from "@trax/core";

// We'll initialize it once globally to avoid recreating it
let supabaseInstance: TypedSupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
    }

    supabaseInstance = createSupabaseClient(url, key);
  }
  return supabaseInstance;
}

const SupabaseContext = createContext<TypedSupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', padding: '20px' }}>
        <div style={{ maxWidth: '600px', backgroundColor: 'var(--bg-secondary)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--error-color)' }}>
          <h2 style={{ color: 'var(--error-color)', marginBottom: '16px' }}>Missing Supabase Configuration</h2>
          <p style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>
            The app cannot start because the Supabase URL and Anon Key are missing.
          </p>
          <p style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
            Please create a <code>.env</code> file in the <strong>root of the monorepo</strong> with:
          </p>
          <pre style={{ backgroundColor: '#000', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflowX: 'auto', color: 'var(--text-primary)' }}>
            VITE_SUPABASE_URL=your_project_url{"\n"}
            VITE_SUPABASE_ANON_KEY=your_anon_key
          </pre>
        </div>
      </div>
    );
  }

  const client = useMemo(() => getSupabase(), []);
  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}

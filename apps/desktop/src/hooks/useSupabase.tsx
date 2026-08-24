import { createContext, useContext, useEffect, useState } from "react";
import { createSupabaseClient, type TypedSupabaseClient } from "@trax/core";
import { tauriAuthStorage } from "./supabaseStorage";
import { LoadingSpinner } from "../components/LoadingSpinner";

let supabaseInstance: TypedSupabaseClient | null = null;

export function getSupabase() {
  if (!supabaseInstance) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!url || !key) {
      console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables");
    }

    supabaseInstance = createSupabaseClient(url, key, {
      auth: {
        storage: tauriAuthStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }
  return supabaseInstance;
}

// undefined = provider missing (developer error).
// The provider only renders children once the client is ready, so the value
// is guaranteed to be a real client whenever useSupabase() can observe it.
const SupabaseContext = createContext<TypedSupabaseClient | undefined>(undefined);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const [client, setClient] = useState<TypedSupabaseClient | null>(null);

  useEffect(() => {
    if (!url || !key) {
      setClient(null);
      return;
    }
    const instance = getSupabase();
    setClient(instance);
  }, [url, key]);

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

  if (!client) {
    return (
      <div className="app-container" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <SupabaseContext.Provider value={client}>
      {children}
    </SupabaseContext.Provider>
  );
}

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error("useSupabase must be used within a SupabaseProvider");
  }
  return context;
}
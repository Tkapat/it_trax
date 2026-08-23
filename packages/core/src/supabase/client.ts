/**
 * @trax/core — Supabase client factory
 *
 * Exports a `createSupabaseClient` factory instead of a module-level singleton.
 * Each consuming app (desktop / mobile) calls this once at startup with its own
 * env values, keeping packages/core free of any env-reading logic.
 *
 * Usage (desktop):
 *   import { createSupabaseClient } from "@trax/core/supabase"
 *   const supabase = createSupabaseClient(
 *     import.meta.env.VITE_SUPABASE_URL,
 *     import.meta.env.VITE_SUPABASE_ANON_KEY
 *   )
 *
 * Usage (mobile / Expo):
 *   import Constants from "expo-constants"
 *   const supabase = createSupabaseClient(
 *     Constants.expoConfig?.extra?.supabaseUrl,
 *     Constants.expoConfig?.extra?.supabaseAnonKey,
 *     { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true } }
 *   )
 */

import { createClient, type SupabaseClient, type SupabaseClientOptions } from "@supabase/supabase-js";
import type { Database } from "../types/database.js";

// ---------------------------------------------------------------------------
// Re-export the typed client type for use in consuming packages
// ---------------------------------------------------------------------------
export type TypedSupabaseClient = SupabaseClient<Database>;

// ---------------------------------------------------------------------------
// Validation helper
// ---------------------------------------------------------------------------

function assertNonEmpty(value: string | undefined | null, name: string): string {
  if (!value || value.trim() === "") {
    throw new Error(
      `[trax/core] Missing required Supabase config: "${name}". ` +
        "Check your environment variables."
    );
  }
  return value;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a fully-typed Supabase client for the trax database.
 *
 * @param supabaseUrl  - The project URL (from Supabase dashboard → Settings → API)
 * @param supabaseAnonKey - The `anon` public key
 * @param options      - Optional SupabaseClientOptions (e.g. custom auth storage for RN)
 * @returns A typed `SupabaseClient<Database>` instance
 *
 * @throws {Error} If `supabaseUrl` or `supabaseAnonKey` are empty/undefined
 */
export function createSupabaseClient(
  supabaseUrl: string | undefined | null,
  supabaseAnonKey: string | undefined | null,
  options?: SupabaseClientOptions<"public">
): TypedSupabaseClient {
  const url = assertNonEmpty(supabaseUrl, "SUPABASE_URL");
  const key = assertNonEmpty(supabaseAnonKey, "SUPABASE_ANON_KEY");

  return createClient<Database>(url, key, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      ...options?.auth,
    },
    ...options,
  });
}

// ---------------------------------------------------------------------------
// Re-export useful Supabase types that consumers need
// ---------------------------------------------------------------------------
export type { SupabaseClient, SupabaseClientOptions };
export type { Session, User, AuthError } from "@supabase/supabase-js";

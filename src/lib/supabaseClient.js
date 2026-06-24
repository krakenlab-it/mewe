import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export const backendMode = (import.meta.env.VITE_MEWE_BACKEND_MODE || "auto").toLowerCase();

let supabaseClient = null;

export function requiresSupabaseBackend() {
  return backendMode === "supabase" || import.meta.env.PROD;
}

export function createSupabaseBrowserClient() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  if (supabaseClient) return supabaseClient;

  supabaseClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
  return supabaseClient;
}

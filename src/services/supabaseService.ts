import { createClient } from "@supabase/supabase-js";

// Supabase Client with environment variables support and safe defaults
const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || "https://bxsilckpxcpsgojrakfs.supabase.co";
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || "sb_publishable_LGb-62oHXiolJluDwsXUiw_ZxRfiUpT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  }
});

export const logErrorToSupabase = async (error: string, context: any) => {
    try {
        await fetch("/api/supabase/log-error", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error, context })
        });
    } catch (err) {
        console.error("Failed to log error to Supabase via proxy:", err);
    }
};

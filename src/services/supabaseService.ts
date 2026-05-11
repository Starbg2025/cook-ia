import { createClient } from "@supabase/supabase-js";

// Use public keys defined in vite.config.ts/env vars
const supabaseUrl = "https://bxsilckpxcpsgojrakfs.supabase.co";
const supabaseAnonKey = "sb_publishable_LGb-62oHXiolJluDwsXUiw_ZxRfiUpT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

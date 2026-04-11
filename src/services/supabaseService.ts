import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://bxsilckpxcpsgojrakfs.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_LGb-62oHXiolJluDwsXUiw_ZxRfiUpT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const logErrorToSupabase = async (error: string, context: any) => {
  try {
    await supabase
      .from('error_logs')
      .insert([{ 
        error_message: error, 
        context: context,
        created_at: new Date().toISOString()
      }]);
  } catch (err) {
    console.error("Failed to log error to Supabase:", err);
  }
};

export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  created_at: string;
}

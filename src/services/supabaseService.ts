import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://bxsilckpxcpsgojrakfs.supabase.co";
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_LGb-62oHXiolJluDwsXUiw_ZxRfiUpT";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  created_at: string;
}

// Client-side proxy for Supabase operations to keep keys secret
const callSupabaseProxy = async (table: string, action: string, options: any = {}) => {
  const response = await fetch("/api/supabase/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table, action, ...options })
  });
  
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Failed to call Supabase proxy");
  }
  
  return await response.json();
};

// Minimal mock to avoid breaking App.tsx while keeping keys server-side
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChanged: (callback: any) => {
      // Return a dummy unsubscribe function
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    signOut: async () => ({ error: null }),
    signInWithPopup: async () => ({ data: { user: null }, error: null }),
  },
  from: (table: string) => ({
    select: (query: string = '*') => ({
      order: (field: string, options: any) => ({
        then: (callback: any) => callSupabaseProxy(table, 'select', { query }).then(data => callback({ data, error: null }))
      }),
      then: (callback: any) => callSupabaseProxy(table, 'select', { query }).then(data => callback({ data, error: null }))
    }),
    insert: (data: any) => ({
      then: (callback: any) => callSupabaseProxy(table, 'insert', { data }).then(res => callback({ data: res, error: null }))
    }),
    update: (data: any) => ({
      eq: (field: string, id: any) => ({
        then: (callback: any) => callSupabaseProxy(table, 'update', { data, id }).then(res => callback({ data: res, error: null }))
      })
    }),
    delete: () => ({
      eq: (field: string, id: any) => ({
        then: (callback: any) => callSupabaseProxy(table, 'delete', { id }).then(res => callback({ data: res, error: null }))
      })
    })
  })
} as any;

export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  created_at: string;
}

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

export interface Conversation {
  id: string;
  title: string;
  messages: any[];
  created_at: string;
}

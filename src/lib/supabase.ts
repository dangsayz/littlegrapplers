import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Client for browser/public use
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for server-side operations (bypasses RLS)
// Only create if service key is available (server-side only)
// On client-side (browser), supabaseAdmin should never be used — falls back to anon
const isServer = typeof window === 'undefined';
export const supabaseAdmin: SupabaseClient = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : isServer
    ? (() => { console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing on the server. Admin operations will fail.'); return supabase; })()
    : supabase;

export default supabase;

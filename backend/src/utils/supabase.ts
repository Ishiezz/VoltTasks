import { createClient } from '@supabase/supabase-js';
import { env } from '../config/env';

// Admin client — bypasses RLS for server-side operations
export const supabaseAdmin = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// User-context client factory — respects RLS policies
export const supabaseUser = (accessToken: string) =>
  createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

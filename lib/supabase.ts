/**
 * Supabase Client Configuration
 * Initializes Supabase client with proper typing and environment variables
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// Validate environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.'
  );
}

// Create Supabase client with database types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Server-side client with service role (bypasses RLS)
// WARNING: Only use this on the server side, never expose to client!
export const supabaseAdmin = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY. This is required for admin operations.'
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

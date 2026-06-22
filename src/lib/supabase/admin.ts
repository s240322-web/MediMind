import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

/**
 * Admin client using the service role key. Bypasses Row Level
 * Security entirely — use ONLY for trusted, server-only operations
 * like seeding the global medical dataset.
 *
 * NEVER import this in client components or expose its key to the
 * browser. NEVER use it to serve a request on a user's behalf — use
 * the cookie-scoped `server.ts` client for that so RLS still applies.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

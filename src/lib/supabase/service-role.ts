import 'server-only';
import { createClient as createSbClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Service-Role-Client — bypassed RLS.
 * NEVER import this in client or shared module.
 */
export function createServiceRoleClient() {
  return createSbClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
    }
  );
}

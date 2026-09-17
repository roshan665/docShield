import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iwinomhcofhouapfirjo.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3aW5vbWhjb2Zob3VhcGZpcmpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNDM1OTgsImV4cCI6MjEwMzkxOTU5OH0.Vm5RHwbzKTlbyw8RiU92HqMdfIaMMFtnpAcCPSRw_uE';

if ((!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) && typeof window !== 'undefined') {
  console.warn(
    'Supabase credentials missing. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured in .env.local'
  );
}

/**
 * Official Supabase Client for DocShield.
 * Provides authenticated client-side storage uploads, realtime subscriptions,
 * and direct database integration with the Supabase project backend.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;

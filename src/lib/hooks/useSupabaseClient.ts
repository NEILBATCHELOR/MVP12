import { supabase } from '@/lib/supabase';

/**
 * Hook that provides the Supabase client instance
 * This is a replacement for @supabase/auth-helpers-react's useSupabaseClient
 * 
 * @returns The Supabase client instance
 */
export function useSupabaseClient() {
  return supabase;
}

export default useSupabaseClient; 
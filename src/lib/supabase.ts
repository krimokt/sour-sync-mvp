import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

// Create a Supabase client for use in client components
// This client automatically handles cookies for SSR compatibility
export const supabase = createClientComponentClient<Database>(); 
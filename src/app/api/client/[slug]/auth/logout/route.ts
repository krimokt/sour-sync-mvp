import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}

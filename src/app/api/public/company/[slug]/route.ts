import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Log for debugging
    console.log('[Company API] Request received:', {
      slug,
      path: req.nextUrl.pathname,
      method: req.method,
    });

    if (!slug) {
      return NextResponse.json({ error: 'Missing company slug' }, { status: 400 });
    }

    // Check for required environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing Supabase environment variables:', {
        hasUrl: !!supabaseUrl,
        hasServiceKey: !!supabaseServiceKey,
      });
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Create Supabase client with proper error handling
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    const { data: company, error } = await supabaseAdmin
      .from('companies')
      .select(
        `
        id, name, slug, logo_url, status,
        website_settings:website_settings (
          primary_color
        )
      `
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      return NextResponse.json(
        { error: error.message || 'Company not found' },
        { status: 404 }
      );
    }

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json({ company });
  } catch (e) {
    console.error('Unexpected error in company API:', e);
    const message = e instanceof Error ? e.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}










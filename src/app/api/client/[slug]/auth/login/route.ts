import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!emailRegex.test(trimmedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Get company by slug (use admin client for this)
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug, status')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    if (company.status !== 'active') {
      return NextResponse.json(
        { error: 'Company account is not active' },
        { status: 403 }
      );
    }

    // Use route handler client for proper cookie management in API routes
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    // Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authError || !authData.user) {
      // Handle rate limiting errors specifically
      const errorMessage = authError?.message || 'Invalid email or password';
      if (errorMessage.toLowerCase().includes('rate limit') || 
          errorMessage.toLowerCase().includes('too many requests') ||
          errorMessage.toLowerCase().includes('email rate limit')) {
        return NextResponse.json(
          { 
            error: 'Too many sign-in attempts. Please wait a few minutes before trying again.',
            rateLimited: true
          },
          { status: 429 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is a client of this company
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('company_id', company.id)
      .eq('user_id', authData.user.id)
      .eq('status', 'active')
      .single();

    if (clientError || !client) {
      // Sign out if not a client
      await supabase.auth.signOut();
      return NextResponse.json(
        { error: 'You are not authorized to access this company' },
        { status: 403 }
      );
    }

    // Get user profile
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    // The session cookies are automatically set by createRouteHandlerClient when signInWithPassword succeeds
    // Create response with JSON data
    // The cookies should already be set in the response by the Supabase client
    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        profile,
        client,
      },
      company: {
        id: company.id,
        slug: company.slug,
      },
    });
  } catch (error) {
    console.error('Client login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}









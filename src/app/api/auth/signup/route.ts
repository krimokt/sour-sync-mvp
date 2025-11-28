import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables.');
}

// Server-side Supabase client with service role for admin operations
const supabaseAdmin = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
  : null;

// Client-side Supabase for auth operations
const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

interface SignUpRequest {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  companySlug: string;
}

export async function POST(request: Request) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY' },
        { status: 500 }
      );
    }

    // Use admin client if available, otherwise use regular client
    if (!supabaseAdmin) {
      console.warn('SUPABASE_SERVICE_ROLE_KEY not set. Sign-up may fail if RLS policies block company creation.');
      // Continue anyway - the trigger should handle profile creation
    }
    
    const dbClient = supabaseAdmin || supabase;

    const body: SignUpRequest = await request.json();
    const { email, password, fullName, companyName, companySlug } = body;

    // Validate input
    if (!email || !password || !fullName || !companyName || !companySlug) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/store/${companySlug}`,
      },
    });

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user account' },
        { status: 500 }
      );
    }

    const userId = authData.user.id;

    // Wait for trigger to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Step 2: Create company
    const { data: companyData, error: companyError } = await dbClient
      .from('companies')
      .insert({
        name: companyName,
        slug: companySlug,
        owner_id: userId,
        plan: 'starter',
        status: 'active',
      })
      .select()
      .single();

    if (companyError) {
      console.error('Company creation error:', companyError);
      // Try to clean up the auth user if company creation fails
      // Note: We can't easily delete the auth user, but we can log it
      return NextResponse.json(
        { 
          error: `Failed to create company: ${companyError.message}`,
          code: companyError.code,
          details: companyError.details,
        },
        { status: 400 }
      );
    }

    // Step 3: Update profile with company info
    const { error: profileError } = await dbClient
      .from('profiles')
      .update({
        full_name: fullName,
        email: email,
        role: 'owner',
        company_id: companyData.id,
      })
      .eq('id', userId);

    if (profileError) {
      console.error('Profile update error:', profileError);
      return NextResponse.json(
        { 
          error: `Failed to update profile: ${profileError.message}`,
          code: profileError.code,
          details: profileError.details,
        },
        { status: 400 }
      );
    }

    // Success!
    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        email: authData.user.email,
      },
      company: {
        id: companyData.id,
        slug: companyData.slug,
        name: companyData.name,
      },
      requiresEmailConfirmation: !authData.session, // If no session, email confirmation is required
    });

  } catch (error) {
    console.error('Signup API error:', error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}


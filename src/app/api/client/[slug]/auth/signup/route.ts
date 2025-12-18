import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { email, password, fullName, companyName } = await request.json();

    if (!email || !password || !fullName || !companyName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Trim and validate input strings
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFullName = fullName.trim();
    const trimmedCompanyName = companyName.trim();

    if (!trimmedEmail || !trimmedFullName || !trimmedCompanyName) {
      return NextResponse.json(
        { error: 'All fields must contain valid text' },
        { status: 400 }
      );
    }

    // Get company by slug
    const { data: company, error: companyError } = await supabase
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

    // Check if user already exists by checking profiles
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', trimmedEmail)
      .single();

    if (existingProfile) {
      // Check if they're already a client of this company
      const { data: existingClient } = await supabase
        .from('clients')
        .select('*')
        .eq('company_id', company.id)
        .eq('user_id', existingProfile.id)
        .single();

      if (existingClient) {
        return NextResponse.json(
          { error: 'An account with this email already exists for this company' },
          { status: 400 }
        );
      }
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: trimmedEmail,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: trimmedFullName,
      },
    });

    if (authError || !authData.user) {
      // Provide more user-friendly error messages
      let errorMessage = 'Failed to create account';
      if (authError) {
        if (authError.message.includes('pattern') || authError.message.includes('expected pattern')) {
          errorMessage = 'Invalid email format. Please check your email address.';
        } else if (authError.message.includes('password')) {
          errorMessage = 'Password does not meet requirements. Please use at least 8 characters.';
        } else if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
          errorMessage = 'An account with this email already exists. Please sign in instead.';
        } else {
          errorMessage = authError.message;
        }
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Wait a moment for any triggers to create profile
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check if profile already exists (might be created by trigger)
    const { data: existingProfileAfterAuth } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', authData.user.id)
      .single();

    // Create profile if it doesn't exist
    if (!existingProfileAfterAuth) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: trimmedFullName,
          email: trimmedEmail,
          role: null, // Clients don't have admin roles
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Try to clean up auth user
        await supabase.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { error: `Failed to create profile: ${profileError.message}` },
          { status: 500 }
        );
      }
    } else {
      // Update existing profile
      await supabase
        .from('profiles')
        .update({
          full_name: trimmedFullName,
          email: trimmedEmail,
        })
        .eq('id', authData.user.id);
    }

    // Create client record - ensure company_id is always set
    if (!company.id) {
      // Clean up if company ID is missing
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Invalid company configuration' },
        { status: 500 }
      );
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        company_id: company.id, // Always set from the validated company
        user_id: authData.user.id,
        status: 'active',
        company_name: trimmedCompanyName,
      })
      .select()
      .single();

    if (clientError) {
      console.error('Client creation error:', clientError);
      // Try to clean up
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: `Failed to create client record: ${clientError.message}` },
        { status: 500 }
      );
    }

    // Verify the client was created with correct company_id
    if (!client || client.company_id !== company.id) {
      console.error('Client created with incorrect company_id');
      // Clean up the incorrectly created client
      await supabase.from('clients').delete().eq('id', client?.id);
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create client record with correct company association' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
      },
      client,
    });
  } catch (error) {
    console.error('Client signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during signup';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}






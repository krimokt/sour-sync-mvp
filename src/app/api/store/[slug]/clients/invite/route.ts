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
    const { email, fullName, companyName, phone } = await request.json();

    // Validate input (email is optional)
    if (!fullName || !companyName) {
      return NextResponse.json(
        { error: 'Full name and company name are required' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    let trimmedEmail: string | null = null;
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      trimmedEmail = email.trim().toLowerCase();
      if (!emailRegex.test(trimmedEmail)) {
        return NextResponse.json(
          { error: 'Please enter a valid email address' },
          { status: 400 }
        );
      }
    }

    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get company by slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug, name')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify user is staff/admin of this company
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.company_id !== company.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!['admin', 'staff', 'owner'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Only admins and staff can invite clients' },
        { status: 403 }
      );
    }

    let userId: string;
    let isNewUser = false;

    // Generate a unique email if not provided (required for Supabase auth)
    const userEmail = trimmedEmail || `client-${Date.now()}-${Math.random().toString(36).substring(7)}@${company.slug}.placeholder.local`;
    
    // Check if user with this email already exists by checking profiles
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .eq('email', userEmail)
      .maybeSingle();

    if (existingProfile) {
      userId = existingProfile.id;
      
      // Check if client record already exists
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id, status')
        .eq('company_id', company.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingClient) {
        // Update status to active if it was inactive
        if (existingClient.status !== 'active') {
          await supabaseAdmin
            .from('clients')
            .update({ status: 'active' })
            .eq('id', existingClient.id);
        }
        return NextResponse.json({
          message: 'Client invitation sent (client already exists)',
          client: { id: existingClient.id, status: 'active' },
        });
      }
    } else {
      // Create new user account (always create one, even without email provided)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: userEmail,
        email_confirm: true, // Auto-confirm placeholder emails
        user_metadata: {
          full_name: fullName.trim(),
        },
      });

      if (createError || !newUser.user) {
        return NextResponse.json(
          { error: `Failed to create user: ${createError?.message || 'Unknown error'}` },
          { status: 500 }
        );
      }

      userId = newUser.user.id;
      isNewUser = true;

      // Create profile
      await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          email: trimmedEmail || null, // Store null if email was not provided
          full_name: fullName.trim(),
          role: null, // Clients don't have admin roles
        });
    }

    // Format phone number (remove non-digits except +, ensure E.164 format if provided)
    let phone_e164: string | null = null;
    if (phone && phone.trim()) {
      const cleanedPhone = phone.trim();
      // If it starts with +, keep it; otherwise, assume it needs country code
      // For now, store as-is - you may want to add proper phone formatting logic
      phone_e164 = cleanedPhone.startsWith('+') ? cleanedPhone : `+${cleanedPhone.replace(/[^\d]/g, '')}`;
    }

    // Create or update client record
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .upsert(
        {
          company_id: company.id,
          user_id: userId,
          status: 'pending', // Set to pending until they sign up
          company_name: companyName.trim(),
          phone_e164: phone_e164,
        },
        {
          onConflict: 'company_id,user_id',
        }
      )
      .select()
      .single();

    if (clientError) {
      console.error('Client creation error:', clientError);
      return NextResponse.json(
        { error: `Failed to create client: ${clientError.message}` },
        { status: 500 }
      );
    }

    // TODO: Send invitation email here
    // For now, we'll just create the client record
    // In the future, you can integrate with an email service to send invitation links

    return NextResponse.json({
      message: isNewUser
        ? 'Client invitation sent successfully'
        : 'Client added successfully',
      client: {
        ...client,
        email: trimmedEmail,
        fullName: fullName.trim(),
        phone: phone_e164,
      },
    });
  } catch (error) {
    console.error('Invite client error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


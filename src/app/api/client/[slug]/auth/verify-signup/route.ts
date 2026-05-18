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
    const { email, token, fullName, companyName, password } = await request.json();

    if (!email || !token || !fullName || !companyName || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Get company
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id, slug, status, resend_api_key')
      .eq('slug', slug)
      .single();

    if (!company || company.status !== 'active') {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (company.resend_api_key) {
      // Verify against our custom OTP table
      const { data: otpRecord } = await supabaseAdmin
        .from('client_otp_verifications')
        .select('id, code, expires_at, used')
        .eq('company_id', company.id)
        .eq('email', normalizedEmail)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!otpRecord) {
        return NextResponse.json(
          { error: 'No verification code found. Please request a new one.' },
          { status: 400 }
        );
      }

      if (new Date(otpRecord.expires_at) < new Date()) {
        return NextResponse.json(
          { error: 'Code has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      if (otpRecord.code !== token.trim()) {
        return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 });
      }

      // Mark as used
      await supabaseAdmin
        .from('client_otp_verifications')
        .update({ used: true })
        .eq('id', otpRecord.id);

      // Create or get auth user
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = existingUsers?.users?.find(u => u.email === normalizedEmail);

      let userId: string;

      if (existingUser) {
        userId = existingUser.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName.trim() },
        });
      } else {
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password,
          email_confirm: true,
          user_metadata: { full_name: fullName.trim() },
        });

        if (createError || !newUser.user) {
          return NextResponse.json({ error: createError?.message || 'Failed to create user' }, { status: 500 });
        }
        userId = newUser.user.id;
      }

      // Upsert profile
      await new Promise(resolve => setTimeout(resolve, 500));
      const { data: existingProfile } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!existingProfile) {
        await supabaseAdmin.from('profiles').insert({
          id: userId,
          full_name: fullName.trim(),
          email: normalizedEmail,
          role: null,
        });
      } else {
        await supabaseAdmin.from('profiles').update({
          full_name: fullName.trim(),
          email: normalizedEmail,
        }).eq('id', userId);
      }

      // Check if already a client
      const { data: existingClient } = await supabaseAdmin
        .from('clients')
        .select('id')
        .eq('company_id', company.id)
        .eq('user_id', userId)
        .single();

      if (!existingClient) {
        const { error: clientError } = await supabaseAdmin.from('clients').insert({
          company_id: company.id,
          user_id: userId,
          status: 'active',
          company_name: companyName.trim(),
        });

        if (clientError) {
          return NextResponse.json({ error: clientError.message }, { status: 500 });
        }
      }

      return NextResponse.json({ success: true });
    }

    // Fallback: verify via Supabase built-in OTP
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: token.trim(),
      type: 'email',
    });

    if (verifyError || !verifyData.user) {
      return NextResponse.json(
        { error: 'Invalid or expired code. Please try again.' },
        { status: 400 }
      );
    }

    const userId = verifyData.user.id;

    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { full_name: fullName.trim() },
    });

    await new Promise(resolve => setTimeout(resolve, 500));

    const { data: existingProfile } = await supabaseAdmin
      .from('profiles').select('id').eq('id', userId).single();

    if (!existingProfile) {
      await supabaseAdmin.from('profiles').insert({
        id: userId,
        full_name: fullName.trim(),
        email: normalizedEmail,
        role: null,
      });
    } else {
      await supabaseAdmin.from('profiles').update({
        full_name: fullName.trim(),
        email: normalizedEmail,
      }).eq('id', userId);
    }

    const { data: existingClient } = await supabaseAdmin
      .from('clients').select('id')
      .eq('company_id', company.id).eq('user_id', userId).single();

    if (!existingClient) {
      await supabaseAdmin.from('clients').insert({
        company_id: company.id,
        user_id: userId,
        status: 'active',
        company_name: companyName.trim(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Verify signup error:', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}

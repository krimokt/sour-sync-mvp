import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // Fetch company + email settings
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id, status, resend_api_key, email_from_domain')
      .eq('slug', slug)
      .single();

    if (!company || company.status !== 'active') {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const code = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Store OTP in DB (invalidate previous codes for this email+company)
    await supabaseAdmin
      .from('client_otp_verifications')
      .update({ used: true })
      .eq('company_id', company.id)
      .eq('email', normalizedEmail)
      .eq('used', false);

    await supabaseAdmin.from('client_otp_verifications').insert({
      company_id: company.id,
      email: normalizedEmail,
      code,
      expires_at: expiresAt,
    });

    // Send via Resend if configured, otherwise fallback to Supabase built-in
    if (company.resend_api_key && company.email_from_domain) {
      const fromAddress = `noreply@${company.email_from_domain}`;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${company.resend_api_key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: fromAddress,
          to: normalizedEmail,
          subject: 'Your verification code',
          html: `
            <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
              <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px">Verify your email</h2>
              <p style="font-size:14px;color:#64748b;margin:0 0 24px">Use the code below to complete your sign-up. It expires in 10 minutes.</p>
              <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px">
                <span style="font-size:36px;font-weight:800;letter-spacing:0.25em;color:#0f172a">${code}</span>
              </div>
              <p style="font-size:12px;color:#94a3b8;margin:0">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        }),
      });

      if (!resendRes.ok) {
        const err = await resendRes.json().catch(() => ({}));
        console.error('Resend error:', err);
        return NextResponse.json(
          { error: 'Failed to send verification email. Check your Resend API key and domain.' },
          { status: 500 }
        );
      }
    } else {
      // Fallback: use Supabase built-in OTP (requires Supabase SMTP configured)
      const { createClient: createAnonClient } = await import('@supabase/supabase-js');
      const supabaseAnon = createAnonClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      const { error } = await supabaseAnon.auth.signInWithOtp({
        email: normalizedEmail,
        options: { shouldCreateUser: true },
      });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true, usedResend: !!(company.resend_api_key && company.email_from_domain) });
  } catch (err) {
    console.error('Send OTP error:', err);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}

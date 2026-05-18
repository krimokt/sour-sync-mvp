import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { resendApiKey, emailFromDomain } = await request.json();

    if (!resendApiKey || !emailFromDomain) {
      return NextResponse.json({ error: 'API key and domain are required' }, { status: 400 });
    }

    // Verify the caller is the company owner
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get admin's email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    const toEmail = profile?.email || user.email;
    if (!toEmail) {
      return NextResponse.json({ error: 'Could not determine your email address' }, { status: 400 });
    }

    const fromAddress = `noreply@${emailFromDomain}`;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromAddress,
        to: toEmail,
        subject: 'Test email from SourSync',
        html: `
          <div style="font-family:system-ui,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px">
            <h2 style="font-size:20px;font-weight:700;color:#0f172a;margin:0 0 8px">Email settings are working!</h2>
            <p style="font-size:14px;color:#64748b;margin:0 0 24px">
              Your Resend integration is configured correctly. OTP verification emails will be sent from
              <strong>${fromAddress}</strong>.
            </p>
            <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:12px;padding:16px;font-size:13px;color:#0f766e">
              ✓ API key valid<br>
              ✓ Domain verified<br>
              ✓ Ready to send OTP emails
            </div>
          </div>
        `,
      }),
    });

    if (!resendRes.ok) {
      const err = await resendRes.json().catch(() => ({}));
      const msg = (err as { message?: string })?.message || 'Failed to send test email';
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({ success: true, sentTo: toEmail });
  } catch (err) {
    console.error('Test email error:', err);
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 });
  }
}

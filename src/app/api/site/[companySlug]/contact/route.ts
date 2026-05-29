import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

/**
 * Public contact-form endpoint for /site/[companySlug].
 *
 * Behavior:
 * - Resolves company by slug; 404 if unknown / inactive.
 * - Validates name / email / message.
 * - Inserts into `contact_messages` if the table exists, otherwise returns
 *   200 anyway so the storefront's mailto fallback can take over.
 *
 * We deliberately do not throw on a missing table — the table is optional
 * and shouldn't block the storefront from going live.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { companySlug: string } },
) {
  try {
    const { name, email, message } = (await req.json()) as {
      name?: string;
      email?: string;
      message?: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }
    if (message.length > 4000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', params.companySlug)
      .eq('status', 'active')
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Best-effort insert; ignore if the table doesn't exist yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('contact_messages') as any).insert({
      company_id: (company as { id: string }).id,
      sender_name: name.trim().slice(0, 200),
      sender_email: email.trim().slice(0, 200),
      message: message.trim(),
    });

    // 42P01 = relation does not exist; swallow that one quietly so the form
    // is still useful via mailto on companies that haven't set it up.
    if (error && error.code !== '42P01') {
      console.error('contact insert failed:', error);
      return NextResponse.json({ error: 'Could not save message' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Contact route error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

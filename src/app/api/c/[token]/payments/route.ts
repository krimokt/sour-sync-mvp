import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken } from '@/lib/magic-link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to validate token
async function validateToken(token: string) {
  const tokenHash = hashToken(token);
  
  const { data: magicLink, error } = await supabaseAdmin
    .from('client_magic_links')
    .select('id, company_id, client_id, scopes, expires_at, revoked_at, max_uses, use_count')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !magicLink) {
    return { valid: false, error: 'Invalid token' };
  }

  if (new Date() > new Date(magicLink.expires_at)) {
    return { valid: false, error: 'Token expired' };
  }

  if (magicLink.revoked_at) {
    return { valid: false, error: 'Token revoked' };
  }

  if (magicLink.max_uses !== null && magicLink.use_count >= magicLink.max_uses) {
    return { valid: false, error: 'Token max uses reached' };
  }

  return { valid: true, magicLink };
}

// List payments for the client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const validation = await validateToken(token);

    if (!validation.valid || !validation.magicLink) {
      return NextResponse.json(
        { error: validation.error || 'Invalid token' },
        { status: 403 }
      );
    }

    const { magicLink } = validation;

    // Get client to find user_id
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('user_id')
      .eq('id', magicLink.client_id)
      .single();

    // Fetch payments for this client's quotations
    // First, get quotations for this client
    const { data: quotations } = await supabaseAdmin
      .from('quotations')
      .select('id')
      .eq('company_id', magicLink.company_id)
      .eq('user_id', client?.user_id || null);

    const quotationIds = (quotations || []).map((q) => q.id);

    // Get payments linked to these quotations
    const { data: payments, error } = await supabaseAdmin
      .from('payments')
      .select(`
        *,
        payment_quotations (
          quotation_id,
          quotations (
            id,
            quotation_id,
            product_name
          )
        )
      `)
      .eq('company_id', magicLink.company_id)
      .in('id', quotationIds.length > 0 ? quotationIds : ['00000000-0000-0000-0000-000000000000']) // Empty array workaround
      .order('created_at', { ascending: false });

    // Also get payments by user_id if available
    if (client?.user_id) {
      const { data: userPayments } = await supabaseAdmin
        .from('payments')
        .select(`
          *,
          payment_quotations (
            quotation_id,
            quotations (
              id,
              quotation_id,
              product_name
            )
          )
        `)
        .eq('company_id', magicLink.company_id)
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false });

      // Merge and deduplicate
      const allPayments = [...(payments || []), ...(userPayments || [])];
      const uniquePayments = Array.from(
        new Map(allPayments.map((p) => [p.id, p])).values()
      );

      return NextResponse.json({ payments: uniquePayments });
    }

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ payments: payments || [] });
  } catch (error) {
    console.error('List payments error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Create Stripe payment intent (placeholder - implement Stripe integration)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const validation = await validateToken(token);

    if (!validation.valid || !validation.magicLink) {
      return NextResponse.json(
        { error: validation.error || 'Invalid token' },
        { status: 403 }
      );
    }

    const { magicLink } = validation;

    // Check if 'pay' scope is allowed
    if (!magicLink.scopes || !magicLink.scopes.includes('pay')) {
      return NextResponse.json(
        { error: 'You do not have permission to make payments' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { quotationId, amount } = body;

    if (!quotationId || !amount) {
      return NextResponse.json(
        { error: 'quotationId and amount are required' },
        { status: 400 }
      );
    }

    // TODO: Implement Stripe payment intent creation
    // For now, return a placeholder response
    return NextResponse.json({
      message: 'Stripe integration coming soon',
      paymentIntentId: 'placeholder',
    });
  } catch (error) {
    console.error('Create payment error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken } from '@/lib/magic-link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to validate token and get magic link data
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

// Get payments
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
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('user_id')
      .eq('id', magicLink.client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.user_id) {
      return NextResponse.json(
        { error: 'Client user ID not found' },
        { status: 404 }
      );
    }

    // Get payments for this client
    const { data: payments, error: paymentsError } = await supabaseAdmin
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

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
      return NextResponse.json(
        { error: `Failed to fetch payments: ${paymentsError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      payments: payments || [],
    });
  } catch (error) {
    console.error('Get payments error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Create payment
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
    const body = await request.json();
    const { quotation_id, amount, payment_method, bank_account_id, crypto_wallet_id } = body;
    
    // Store payment method details in metadata for future reference
    const paymentMetadata: Record<string, unknown> = {};
    if (bank_account_id) {
      paymentMetadata.bank_account_id = bank_account_id;
    }
    if (crypto_wallet_id) {
      paymentMetadata.crypto_wallet_id = crypto_wallet_id;
    }

    if (!quotation_id || !amount) {
      return NextResponse.json(
        { error: 'Quotation ID and amount are required' },
        { status: 400 }
      );
    }

    // Get client to find user_id
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('user_id, name, email, company_name')
      .eq('id', magicLink.client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Verify quotation belongs to this client
    const { data: quotation, error: quotationError } = await supabaseAdmin
      .from('quotations')
      .select('id, company_id, user_id, status, selected_option')
      .eq('id', quotation_id)
      .eq('company_id', magicLink.company_id)
      .eq('user_id', client.user_id)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    if (quotation.status !== 'Approved') {
      return NextResponse.json(
        { error: 'Quotation must be approved before payment' },
        { status: 400 }
      );
    }

    if (!quotation.selected_option) {
      return NextResponse.json(
        { error: 'Please select a price option first' },
        { status: 400 }
      );
    }

    // Generate reference number
    const referenceNumber = `PAY-${new Date().getFullYear()}-${Math.floor(Math.random() * 100000).toString().padStart(6, '0')}`;

    // Create payment
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        company_id: magicLink.company_id,
        user_id: client.user_id,
        amount: amount.toString(),
        currency: 'USD',
        payment_method: payment_method || 'Bank Transfer',
        status: 'pending',
        reference_number: referenceNumber,
        payer_name: client.name || client.company_name || 'Client',
        payer_email: client.email || null,
        quotation_ids: [quotation_id],
        metadata: Object.keys(paymentMetadata).length > 0 ? paymentMetadata : null,
      })
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      return NextResponse.json(
        { error: `Failed to create payment: ${paymentError.message}` },
        { status: 500 }
      );
    }

    // Link payment to quotation
    const { error: linkError } = await supabaseAdmin
      .from('payment_quotations')
      .insert({
        payment_id: payment.id,
        quotation_id: quotation_id,
        user_id: client.user_id,
        company_id: magicLink.company_id,
      });

    if (linkError) {
      console.error('Error linking payment to quotation:', linkError);
      // Don't fail the request, payment was created
    }

    return NextResponse.json({
      success: true,
      payment: payment,
    }, { status: 201 });
  } catch (error) {
    console.error('Create payment error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

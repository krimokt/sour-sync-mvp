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

// List shipments for the client
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

    // Fetch shipments for this client's quotations
    // First, get quotations for this client
    const { data: quotations } = await supabaseAdmin
      .from('quotations')
      .select('id')
      .eq('company_id', magicLink.company_id)
      .eq('user_id', client?.user_id || null);

    const quotationIds = (quotations || []).map((q) => q.id);

    // If no quotations found, return empty array
    if (quotationIds.length === 0) {
      return NextResponse.json({ shipments: [] });
    }

    // Get shipments linked to these quotations
    const { data: shipments, error } = await supabaseAdmin
      .from('shipping')
      .select(`
        *,
        quotations (
          id,
          quotation_id,
          product_name
        )
      `)
      .eq('company_id', magicLink.company_id)
      .in('quotation_id', quotationIds)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching shipments:', error);
      return NextResponse.json(
        { error: 'Failed to fetch shipments' },
        { status: 500 }
      );
    }

    return NextResponse.json({ shipments: shipments || [] });
  } catch (error) {
    console.error('List shipments error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


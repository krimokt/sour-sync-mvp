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

// Get shipment details with tracking events
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { token, id } = await params;
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const { magicLink } = validation;

    // Get shipment
    const { data: shipment, error } = await supabaseAdmin
      .from('shipping')
      .select(`
        *,
        quotations (
          id,
          quotation_id,
          product_name,
          image_url
        )
      `)
      .eq('id', id)
      .eq('company_id', magicLink.company_id)
      .single();

    if (error || !shipment) {
      return NextResponse.json(
        { error: 'Shipment not found' },
        { status: 404 }
      );
    }

    // Note: If you have a tracking_events table, fetch it here
    // For now, we'll return the shipment data

    return NextResponse.json({ 
      shipment,
      // trackingEvents: [] // Add when tracking_events table exists
    });
  } catch (error) {
    console.error('Get shipment error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


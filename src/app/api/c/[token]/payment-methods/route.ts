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

// Get payment methods (bank accounts and crypto wallets)
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

    // Fetch bank accounts
    const { data: bankAccounts, error: bankError } = await supabaseAdmin
      .from('bank_accounts')
      .select('*')
      .eq('company_id', magicLink.company_id)
      .eq('is_active', true)
      .order('sort_order');

    if (bankError) {
      console.error('Error fetching bank accounts:', bankError);
    }

    // Fetch crypto wallets
    const { data: cryptoWallets, error: cryptoError } = await supabaseAdmin
      .from('crypto_wallets')
      .select('*')
      .eq('company_id', magicLink.company_id)
      .eq('is_active', true)
      .order('sort_order');

    if (cryptoError) {
      console.error('Error fetching crypto wallets:', cryptoError);
    }

    return NextResponse.json({
      bankAccounts: bankAccounts || [],
      cryptoWallets: cryptoWallets || [],
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


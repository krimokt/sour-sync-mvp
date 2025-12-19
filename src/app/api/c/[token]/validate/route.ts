import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken, verifyToken, validateMagicLink } from '@/lib/magic-link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Hash the token to look it up
    const tokenHash = hashToken(token);

    // Find the magic link
    const { data: magicLink, error: magicLinkError } = await supabaseAdmin
      .from('client_magic_links')
      .select(`
        id,
        company_id,
        client_id,
        token_hash,
        expires_at,
        revoked_at,
        max_uses,
        use_count,
        scopes,
        client_name_snapshot,
        client_phone_snapshot,
        companies (
          id,
          name,
          slug,
          logo_url
        ),
        clients (
          id,
          name,
          phone_e164,
          email,
          company_name
        )
      `)
      .eq('token_hash', tokenHash)
      .single();

    if (magicLinkError || !magicLink) {
      return NextResponse.json(
        { error: 'Invalid or expired magic link' },
        { status: 404 }
      );
    }

    // Validate the magic link
    const validation = validateMagicLink(magicLink);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || 'Magic link is invalid' },
        { status: 403 }
      );
    }

    // Update access tracking
    await supabaseAdmin
      .from('client_magic_links')
      .update({
        last_accessed_at: new Date().toISOString(),
        use_count: (magicLink.use_count || 0) + 1,
      })
      .eq('id', magicLink.id);

    // Extract company and client data
    const company = Array.isArray(magicLink.companies) 
      ? magicLink.companies[0] 
      : magicLink.companies;
    const client = Array.isArray(magicLink.clients)
      ? magicLink.clients[0]
      : magicLink.clients;

    return NextResponse.json({
      data: {
        magicLinkId: magicLink.id,
        companyId: magicLink.company_id,
        clientId: magicLink.client_id,
        companyName: (company as { name?: string })?.name || 'Company',
        clientName: magicLink.client_name_snapshot,
        clientPhone: magicLink.client_phone_snapshot,
        scopes: magicLink.scopes || ['view', 'pay', 'track'],
        company: company,
        client: client,
      },
    });
  } catch (error) {
    console.error('Validate magic link error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


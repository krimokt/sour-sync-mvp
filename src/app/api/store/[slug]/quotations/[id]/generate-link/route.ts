import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { randomBytes } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

/**
 * Generates a crypto-random token and returns both token and hash
 */
function generateToken(): { token: string; tokenHash: string } {
  // Generate 32 bytes (256 bits) of random data
  const randomData = randomBytes(32);
  // Convert to base64url (URL-safe base64)
  const token = randomData.toString('base64url');
  // Hash with SHA-256
  const tokenHash = createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; quotationId: string } }
) {
  try {
    const body = await request.json();
    const { clientId, scopes, expiresInDays, maxUses } = body;

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Get company ID from slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug')
      .eq('slug', params.slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify quotation exists
    const { data: quotation, error: quotationError } = await supabaseAdmin
      .from('quotations')
      .select('id')
      .eq('id', params.quotationId)
      .eq('company_id', company.id)
      .single();

    if (quotationError || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Get client data for snapshots
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('name, phone_e164')
      .eq('id', clientId)
      .eq('company_id', company.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    if (!client.name || !client.phone_e164) {
      return NextResponse.json(
        { error: 'Client must have name and phone' },
        { status: 400 }
      );
    }

    // Generate token and hash
    const { token, tokenHash } = generateToken();

    // Set expiration (default 14 days)
    const expiresIn = expiresInDays || 14;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresIn);

    // Validate scopes
    const validScopes = scopes || ['view', 'pay', 'track'];
    const invalidScopes = validScopes.filter(
      (s: string) => !['view', 'pay', 'track'].includes(s)
    );
    if (invalidScopes.length > 0) {
      return NextResponse.json(
        { error: `Invalid scopes: ${invalidScopes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create magic link record
    const { data: magicLink, error: insertError } = await supabaseAdmin
      .from('client_magic_links')
      .insert({
        company_id: company.id,
        quotation_id: quotation.id,
        client_id: clientId,
        token_hash: tokenHash,
        scopes: validScopes,
        expires_at: expiresAt.toISOString(),
        client_name_snapshot: client.name,
        client_phone_snapshot: client.phone_e164,
        max_uses: maxUses || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating magic link:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    // Construct link URL
    const linkUrl = `/c/q/${token}`;

    // Return token and link URL (token is only returned once, never stored)
    return NextResponse.json(
      {
        link: {
          id: magicLink.id,
          url: linkUrl,
          token, // Returned only once, never stored
          expiresAt: magicLink.expires_at,
          scopes: magicLink.scopes,
        },
        client: {
          name: client.name,
          phone: client.phone_e164,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating link:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


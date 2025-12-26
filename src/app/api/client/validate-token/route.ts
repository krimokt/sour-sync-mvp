import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { createClient } from '@supabase/supabase-js';
import { hashToken, verifyToken } from '@/lib/magic-link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Hash the token to look it up
    const tokenHash = hashToken(token);
    
    // Find the magic link by token hash
    const { data: magicLink, error: linksError } = await supabase
      .from('client_magic_links')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (linksError || !magicLink) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Verify the token matches (double check with timing-safe comparison)
    if (!verifyToken(token, magicLink.token_hash)) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const validLink = magicLink;

    // Check if token is expired
    const expiresAt = new Date(validLink.expires_at);
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token has expired' },
        { status: 401 }
      );
    }

    // Check if token is revoked
    if (validLink.revoked_at) {
      return NextResponse.json(
        { error: 'Token has been revoked' },
        { status: 401 }
      );
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', validLink.client_id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get company data including quotation settings
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, slug, quotation_countries')
      .eq('id', validLink.company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Update usage tracking
    const newUseCount = (validLink.use_count || 0) + 1;
    await supabase
      .from('client_magic_links')
      .update({ 
        use_count: newUseCount,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', validLink.id);

    return NextResponse.json({
      valid: true,
      client: {
        id: client.id,
        name: client.name,
        phone_e164: client.phone_e164,
        email: client.email,
        company_name: client.company_name,
      },
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        quotation_countries: company.quotation_countries || [],
      },
      magicLink: {
        id: validLink.id,
        expiresAt: validLink.expires_at,
      },
    });
  } catch (error) {
    console.error('Token validation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


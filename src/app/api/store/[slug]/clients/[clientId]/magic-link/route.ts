import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';
import { generateToken, hashToken } from '@/lib/magic-link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a new magic link for a client
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; clientId: string }> }
) {
  try {
    const { slug, clientId } = await params;
    const body = await request.json();
    const {
      expiresInDays = 30,
      maxUses = null,
      quotationId = null,
      scopes = ['view', 'pay', 'track'],
    } = body;

    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get company by slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug, name')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify user is staff/admin of this company
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.company_id !== company.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!['admin', 'staff', 'owner'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Only admins and staff can generate magic links' },
        { status: 403 }
      );
    }

    // Get client record
    const { data: client, error: clientError } = await supabaseAdmin
      .from('clients')
      .select('id, company_id, name, phone_e164, email, company_name')
      .eq('id', clientId)
      .eq('company_id', company.id)
      .single();

    if (clientError || !client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Ensure client has phone_e164 (required for magic links)
    if (!client.phone_e164) {
      return NextResponse.json(
        { error: 'Client must have a phone number (E.164 format) to generate magic link' },
        { status: 400 }
      );
    }

    // Generate token
    const token = generateToken();
    const tokenHash = hashToken(token);

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    // Validate scopes
    const validScopes = ['view', 'pay', 'track', 'create'];
    const filteredScopes = scopes.filter((s: string) => validScopes.includes(s));
    if (filteredScopes.length === 0) {
      return NextResponse.json(
        { error: 'At least one valid scope must be provided' },
        { status: 400 }
      );
    }

    // Create magic link record
    const { data: magicLink, error: magicLinkError } = await supabaseAdmin
      .from('client_magic_links')
      .insert({
        company_id: company.id,
        client_id: client.id,
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        max_uses: maxUses,
        use_count: 0,
        scopes: filteredScopes,
        quotation_id: quotationId,
        client_name_snapshot: client.name || client.company_name || 'Client',
        client_phone_snapshot: client.phone_e164,
        created_by: user.id,
      })
      .select()
      .single();

    if (magicLinkError) {
      console.error('Error creating magic link:', magicLinkError);
      return NextResponse.json(
        { error: `Failed to create magic link: ${magicLinkError.message}` },
        { status: 500 }
      );
    }

    // Generate the full URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const magicLinkUrl = `${baseUrl}/c/${token}`;

    return NextResponse.json({
      message: 'Magic link generated successfully',
      magicLink: {
        id: magicLink.id,
        token: token, // Return unhashed token for URL generation
        url: magicLinkUrl,
        expiresAt: expiresAt.toISOString(),
        maxUses: maxUses,
        scopes: filteredScopes,
      },
    });
  } catch (error) {
    console.error('Generate magic link error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// List magic links for a client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; clientId: string }> }
) {
  try {
    const { slug, clientId } = await params;

    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get company by slug
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify user is staff/admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.company_id !== company.id || !['admin', 'staff', 'owner'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Get magic links for this client
    const { data: magicLinks, error } = await supabaseAdmin
      .from('client_magic_links')
      .select('id, expires_at, revoked_at, max_uses, use_count, scopes, created_at, last_accessed_at')
      .eq('company_id', company.id)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: `Failed to fetch magic links: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ magicLinks: magicLinks || [] });
  } catch (error) {
    console.error('List magic links error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Revoke a magic link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; clientId: string }> }
) {
  try {
    const { slug, clientId } = await params;
    const { searchParams } = new URL(request.url);
    const magicLinkId = searchParams.get('magicLinkId');

    if (!magicLinkId) {
      return NextResponse.json(
        { error: 'magicLinkId query parameter is required' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get company by slug
    const { data: company } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify user is staff/admin
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.company_id !== company.id || !['admin', 'staff', 'owner'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Revoke the magic link
    const { error } = await supabaseAdmin
      .from('client_magic_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', magicLinkId)
      .eq('company_id', company.id)
      .eq('client_id', clientId);

    if (error) {
      return NextResponse.json(
        { error: `Failed to revoke magic link: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Magic link revoked successfully' });
  } catch (error) {
    console.error('Revoke magic link error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


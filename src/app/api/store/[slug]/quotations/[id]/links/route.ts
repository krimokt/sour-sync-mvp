import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; quotationId: string } }
) {
  try {
    // Get company ID from slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get all links for this quotation
    const { data: links, error: linksError } = await supabaseAdmin
      .from('client_magic_links')
      .select(`
        id,
        token_hash,
        scopes,
        expires_at,
        revoked_at,
        use_count,
        max_uses,
        last_accessed_at,
        client_name_snapshot,
        client_phone_snapshot,
        created_at
      `)
      .eq('company_id', company.id)
      .eq('quotation_id', params.quotationId)
      .order('created_at', { ascending: false });

    if (linksError) {
      return NextResponse.json(
        { error: linksError.message },
        { status: 500 }
      );
    }

    // Format links for response (don't expose token_hash)
    const formattedLinks = (links || []).map((link) => ({
      id: link.id,
      url: `/c/q/[token]`, // Token not stored, so we can't show full URL
      expiresAt: link.expires_at,
      scopes: link.scopes,
      clientName: link.client_name_snapshot,
      clientPhone: link.client_phone_snapshot,
      useCount: link.use_count,
      maxUses: link.max_uses,
      revokedAt: link.revoked_at,
    }));

    return NextResponse.json({ links: formattedLinks }, { status: 200 });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


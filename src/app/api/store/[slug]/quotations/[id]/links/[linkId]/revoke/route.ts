import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; quotationId: string; linkId: string } }
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

    // Revoke the link
    const { error: updateError } = await supabaseAdmin
      .from('client_magic_links')
      .update({ revoked_at: new Date().toISOString() })
      .eq('id', params.linkId)
      .eq('company_id', company.id)
      .eq('quotation_id', params.quotationId);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error revoking link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get all crypto wallets for admin
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get all crypto wallets
    const { data: wallets, error } = await supabase
      .from('crypto_wallets')
      .select('*')
      .eq('company_id', company.id)
      .order('sort_order');

    if (error) {
      console.error('Error fetching crypto wallets:', error);
      return NextResponse.json({ error: 'Failed to fetch crypto wallets' }, { status: 500 });
    }

    return NextResponse.json({ wallets });
  } catch (error) {
    console.error('Crypto wallets GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Create crypto wallet
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json();

    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check limit of 4 crypto wallets
    const { count } = await supabase
      .from('crypto_wallets')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id);

    if (count && count >= 4) {
      return NextResponse.json(
        { error: 'Maximum of 4 crypto wallets allowed per company' },
        { status: 400 }
      );
    }

    // Create crypto wallet
    const { data: wallet, error } = await supabase
      .from('crypto_wallets')
      .insert({
        company_id: company.id,
        wallet_name: body.wallet_name,
        wallet_address: body.wallet_address,
        cryptocurrency: body.cryptocurrency,
        network: body.network || null,
        qr_code_url: body.qr_code_url || null,
        image_url: body.image_url || null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating crypto wallet:', error);
      return NextResponse.json({ error: 'Failed to create crypto wallet' }, { status: 500 });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Crypto wallet POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}






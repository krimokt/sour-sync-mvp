import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCompanyMember } from '@/lib/route-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update crypto wallet
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const auth = await requireCompanyMember(request, slug, ['owner', 'admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    // Update crypto wallet
    const { data: wallet, error } = await supabase
      .from('crypto_wallets')
      .update({
        wallet_name: body.wallet_name,
        wallet_address: body.wallet_address,
        cryptocurrency: body.cryptocurrency,
        network: body.network || null,
        qr_code_url: body.qr_code_url || null,
        image_url: body.image_url || null,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', auth.company.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating crypto wallet:', error);
      return NextResponse.json({ error: 'Failed to update crypto wallet' }, { status: 500 });
    }

    return NextResponse.json({ wallet });
  } catch (error) {
    console.error('Crypto wallet PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Delete crypto wallet
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const auth = await requireCompanyMember(request, slug, ['owner', 'admin']);
  if (!auth.ok) return auth.response;

  try {
    // Delete crypto wallet
    const { error } = await supabase
      .from('crypto_wallets')
      .delete()
      .eq('id', id)
      .eq('company_id', auth.company.id);

    if (error) {
      console.error('Error deleting crypto wallet:', error);
      return NextResponse.json({ error: 'Failed to delete crypto wallet' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Crypto wallet DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

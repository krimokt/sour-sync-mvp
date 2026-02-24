import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { requireCompanyMember } from '@/lib/route-auth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update bank account
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const auth = await requireCompanyMember(request, slug, ['owner', 'admin']);
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();

    // Update bank account
    const { data: account, error } = await supabase
      .from('bank_accounts')
      .update({
        bank_name: body.bank_name,
        account_name: body.account_name || body.bank_name,
        account_number: body.account_number || null,
        rib: body.rib || null,
        iban: body.iban || null,
        swift_code: body.swift_code || null,
        routing_number: body.routing_number || null,
        branch_name: body.branch_name || null,
        currency: body.currency || 'USD',
        instructions: body.instructions || null,
        image_url: body.image_url || null,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('company_id', auth.company.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bank account:', error);
      return NextResponse.json({ error: 'Failed to update bank account' }, { status: 500 });
    }

    return NextResponse.json({ account });
  } catch (error) {
    console.error('Bank account PUT error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Delete bank account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const auth = await requireCompanyMember(request, slug, ['owner', 'admin']);
  if (!auth.ok) return auth.response;

  try {
    // Delete bank account
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', id)
      .eq('company_id', auth.company.id);

    if (error) {
      console.error('Error deleting bank account:', error);
      return NextResponse.json({ error: 'Failed to delete bank account' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Bank account DELETE error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

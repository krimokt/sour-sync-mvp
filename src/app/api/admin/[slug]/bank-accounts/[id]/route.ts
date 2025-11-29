import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update bank account
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
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

    // Update bank account
    const { data: account, error } = await supabase
      .from('bank_accounts')
      .update({
        bank_name: body.bank_name,
        account_name: body.account_name,
        account_number: body.account_number || null,
        iban: body.iban || null,
        swift_code: body.swift_code || null,
        routing_number: body.routing_number || null,
        branch_name: body.branch_name || null,
        currency: body.currency || 'USD',
        instructions: body.instructions || null,
        is_active: body.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .eq('company_id', company.id)
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
  { params }: { params: { slug: string; id: string } }
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

    // Delete bank account
    const { error } = await supabase
      .from('bank_accounts')
      .delete()
      .eq('id', params.id)
      .eq('company_id', company.id);

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




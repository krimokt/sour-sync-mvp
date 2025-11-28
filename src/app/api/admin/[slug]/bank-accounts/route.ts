import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get all bank accounts for admin
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

    // Get all bank accounts
    const { data: accounts, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('company_id', company.id)
      .order('sort_order');

    if (error) {
      console.error('Error fetching bank accounts:', error);
      return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 });
    }

    return NextResponse.json({ accounts });
  } catch (error: any) {
    console.error('Bank accounts GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Create bank account
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

    // Create bank account
    const { data: account, error } = await supabase
      .from('bank_accounts')
      .insert({
        company_id: company.id,
        bank_name: body.bank_name,
        account_name: body.account_name,
        account_number: body.account_number || null,
        iban: body.iban || null,
        swift_code: body.swift_code || null,
        routing_number: body.routing_number || null,
        branch_name: body.branch_name || null,
        currency: body.currency || 'USD',
        instructions: body.instructions || null,
        is_active: body.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating bank account:', error);
      return NextResponse.json({ error: 'Failed to create bank account' }, { status: 500 });
    }

    return NextResponse.json({ account });
  } catch (error: any) {
    console.error('Bank account POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


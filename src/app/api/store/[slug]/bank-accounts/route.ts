import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get active bank accounts for a store (public)
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
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get active bank accounts
    const { data: accounts, error } = await supabase
      .from('bank_accounts')
      .select('*')
      .eq('company_id', company.id)
      .eq('is_active', true)
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


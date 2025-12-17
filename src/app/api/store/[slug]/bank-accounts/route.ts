import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get active bank accounts for a store (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get active bank accounts (get all up to 4)
    const { data: accounts, error, count } = await supabase
      .from('bank_accounts')
      .select('*', { count: 'exact' })
      .eq('company_id', company.id)
      .eq('is_active', true)
      .order('sort_order')
      .limit(4); // Explicitly set limit to 4

    if (error) {
      console.error('Error fetching bank accounts:', error);
      return NextResponse.json({ error: 'Failed to fetch bank accounts' }, { status: 500 });
    }

    console.log(`[Bank Accounts API] Company: ${company.id}, Found: ${accounts?.length || 0} accounts, Count: ${count}`);
    
    return NextResponse.json({ accounts: accounts || [] });
  } catch (error) {
    console.error('Bank accounts GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}






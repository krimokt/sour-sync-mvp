import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const PAYMENT_COLUMNS =
  'id, company_id, user_id, total_amount, status, payment_method, created_at, updated_at, quotation_ids, reference, notes';

export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get('company_id');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100', 10) || 100, 200);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10) || 0;
    const status = searchParams.get('status');

    if (!companyId) {
      return NextResponse.json({ error: 'company_id is required' }, { status: 400 });
    }

    let query = supabase
      .from('payments')
      .select(PAYMENT_COLUMNS, { count: 'exact' })
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { data, count, limit, offset },
      { headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=120' } },
    );
  } catch (err) {
    console.error('Unexpected error in payments API:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; clientId: string }> }
) {
  try {
    const { slug, clientId } = await params;
    const { status } = await request.json();

    if (!status || !['active', 'inactive', 'pending'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be active, inactive, or pending' },
        { status: 400 }
      );
    }

    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get company by slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Verify user is staff/admin of this company
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.company_id !== company.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    if (!['admin', 'staff', 'owner'].includes(profile.role || '')) {
      return NextResponse.json(
        { error: 'Only admins and staff can manage clients' },
        { status: 403 }
      );
    }

    // Verify client belongs to this company
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('id, company_id')
      .eq('id', clientId)
      .eq('company_id', company.id)
      .single();

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Update client status
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ status })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating client status:', updateError);
      return NextResponse.json(
        { error: `Failed to update client: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: status === 'inactive' ? 'Client banned successfully' : `Client status updated to ${status}`,
      client: updatedClient,
    });
  } catch (error) {
    console.error('Ban client error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}



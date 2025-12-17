import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get client addresses
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get company by slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check authentication
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user is a client of this company
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!client) {
      return NextResponse.json({ error: 'You are not authorized' }, { status: 403 });
    }

    // Fetch addresses
    const { data: addresses, error: addressesError } = await supabaseAdmin
      .from('client_addresses')
      .select('*')
      .eq('user_id', user.id)
      .eq('company_id', company.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (addressesError) {
      console.error('Error fetching addresses:', addressesError);
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }

    return NextResponse.json({ addresses: addresses || [] });
  } catch (error) {
    console.error('Get addresses error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Create client address
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();

    const {
      full_name,
      company_name,
      address_line_1,
      address_line_2,
      city,
      country,
      phone,
    } = body;

    if (!full_name || !address_line_1 || !city || !country) {
      return NextResponse.json(
        { error: 'Full name, address line 1, city, and country are required' },
        { status: 400 }
      );
    }

    // Get company by slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Check authentication
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Verify user is a client of this company
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!client) {
      return NextResponse.json({ error: 'You are not authorized' }, { status: 403 });
    }

    // Delete any existing addresses (only one address allowed per client)
    await supabaseAdmin
      .from('client_addresses')
      .delete()
      .eq('user_id', user.id)
      .eq('company_id', company.id);

    // Create address (always set as default since it's the only one)
    const { data: address, error: insertError } = await supabaseAdmin
      .from('client_addresses')
      .insert({
        user_id: user.id,
        company_id: company.id,
        full_name,
        company_name: company_name || null,
        address_line_1: address_line_1 || null,
        address_line_2: address_line_2 || null,
        city,
        country,
        phone: phone || null,
        is_default: true, // Always true since it's the only address
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating address:', insertError);
      return NextResponse.json({ error: 'Failed to create address' }, { status: 500 });
    }

    return NextResponse.json({ address, message: 'Address created successfully' });
  } catch (error) {
    console.error('Create address error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}





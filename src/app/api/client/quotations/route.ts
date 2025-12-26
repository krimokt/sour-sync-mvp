import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken, verifyToken } from '@/lib/magic-link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate token and get client data
async function validateTokenAndGetClient(token: string) {
  try {
    // Hash the token to look it up
    const tokenHash = hashToken(token);
    
    // Find the magic link by token hash
    const { data: magicLink, error: linksError } = await supabase
      .from('client_magic_links')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (linksError || !magicLink) {
      return null;
    }

    // Verify the token matches (double check with timing-safe comparison)
    if (!verifyToken(token, magicLink.token_hash)) {
      return null;
    }

    const validLink = magicLink;

    // Check if token is expired
    const expiresAt = new Date(validLink.expires_at);
    if (expiresAt < new Date()) {
      return null;
    }

    // Check if token is revoked
    if (validLink.revoked_at) {
      return null;
    }

    // Get client data
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', validLink.client_id)
      .single();

    if (clientError || !client) {
      return null;
    }

    // Get company data
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name, slug')
      .eq('id', validLink.company_id)
      .single();

    if (companyError || !company) {
      return null;
    }

    return { client, company, magicLink: validLink };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, ...quotationData } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate token and get client
    const validationResult = await validateTokenAndGetClient(token);

    if (!validationResult) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    const { client, company } = validationResult;

    // Validate required fields
    const requiredFields = ['product_name', 'quantity', 'destination_country', 'destination_city', 'shipping_method', 'service_type'];
    
    for (const field of requiredFields) {
      if (!quotationData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Generate a unique quotation_id if not provided
    const quotation_id = quotationData.quotation_id || `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Create quotation with user_id (client's auth user_id) and company_id
    // Note: user_id is the client's auth.users.id, not the clients.id
    const { data, error } = await supabase
      .from('quotations')
      .insert({
        ...quotationData,
        quotation_id,
        company_id: company.id,
        user_id: client.user_id || null, // client.user_id is the auth.users.id
        status: quotationData.status || 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating quotation:', error);
      return NextResponse.json(
        { error: `Failed to create quotation: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quotation: data,
    }, { status: 201 });
  } catch (error) {
    console.error('Error processing quotation request:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


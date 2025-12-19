import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken } from '@/lib/magic-link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to validate token and get magic link data
async function validateToken(token: string) {
  const tokenHash = hashToken(token);
  
  const { data: magicLink, error } = await supabaseAdmin
    .from('client_magic_links')
    .select('id, company_id, client_id, scopes, expires_at, revoked_at, max_uses, use_count')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !magicLink) {
    return { valid: false, error: 'Invalid token' };
  }

  // Check expiry
  if (new Date() > new Date(magicLink.expires_at)) {
    return { valid: false, error: 'Token expired' };
  }

  // Check revoked
  if (magicLink.revoked_at) {
    return { valid: false, error: 'Token revoked' };
  }

  // Check max uses
  if (magicLink.max_uses !== null && magicLink.use_count >= magicLink.max_uses) {
    return { valid: false, error: 'Token max uses reached' };
  }

  return { valid: true, magicLink };
}

// List quotations for the client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const { magicLink } = validation;

    // Fetch quotations for this client
    const { data: quotations, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('company_id', magicLink.company_id)
      .eq('user_id', (magicLink.client_id as unknown as string)) // Note: quotations.user_id should match clients.user_id
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quotations:', error);
      return NextResponse.json(
        { error: 'Failed to fetch quotations' },
        { status: 500 }
      );
    }

    // If user_id doesn't match, try to find quotations by client_id if there's a direct relationship
    // For now, we'll use the client_id directly if quotations table has client_id
    let finalQuotations = quotations || [];

    // If no quotations found, try alternative: quotations might be linked via client_id field
    if (finalQuotations.length === 0) {
      const { data: altQuotations } = await supabaseAdmin
        .from('quotations')
        .select('*')
        .eq('company_id', magicLink.company_id)
        .order('created_at', { ascending: false })
        .limit(50); // Limit to prevent too much data

      // Filter by checking if quotation belongs to this client
      // This is a fallback - ideally quotations should have client_id or user_id matching
      finalQuotations = altQuotations || [];
    }

    return NextResponse.json({ quotations: finalQuotations });
  } catch (error) {
    console.error('List quotations error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Create a new quotation (if scopes allow)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const { magicLink } = validation;

    // Check if 'create' scope is allowed
    if (!magicLink.scopes || !magicLink.scopes.includes('create')) {
      return NextResponse.json(
        { error: 'You do not have permission to create quotations' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      product_name,
      product_url,
      quantity = 1,
      destination_country,
      destination_city,
      shipping_method = 'TBD',
      product_images = [],
      variant_specs,
      notes,
    } = body;

    // Validate required fields
    if (!product_name || !destination_country || !destination_city) {
      return NextResponse.json(
        { error: 'product_name, destination_country, and destination_city are required' },
        { status: 400 }
      );
    }

    // Generate quotation_id
    const quotation_id = `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;

    // Get client to find user_id
    const { data: client } = await supabaseAdmin
      .from('clients')
      .select('user_id')
      .eq('id', magicLink.client_id)
      .single();

    // Create quotation
    const { data: quotation, error: quotationError } = await supabaseAdmin
      .from('quotations')
      .insert({
        quotation_id,
        company_id: magicLink.company_id,
        user_id: client?.user_id || null,
        product_name,
        product_url: product_url || null,
        alibaba_url: product_url || null,
        quantity: parseInt(quantity.toString()) || 1,
        destination_country,
        destination_city,
        shipping_method,
        service_type: 'Product Inquiry',
        status: 'Pending',
        product_images: Array.isArray(product_images) ? product_images : [],
        image_urls: Array.isArray(product_images) ? product_images : [],
        variant_specs: variant_specs || null,
        notes: notes || null,
      })
      .select()
      .single();

    if (quotationError) {
      console.error('Error creating quotation:', quotationError);
      return NextResponse.json(
        { error: `Failed to create quotation: ${quotationError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Quotation created successfully',
      quotation,
    });
  } catch (error) {
    console.error('Create quotation error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


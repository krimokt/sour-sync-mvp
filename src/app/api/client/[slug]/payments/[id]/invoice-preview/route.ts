import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

interface CartItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  image?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const paymentId = params.id;

    // Fetch payment data
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Check if payment status is accepted
    const acceptedStatuses = ['Accepted', 'accepted', 'approved', 'completed'];
    if (!acceptedStatuses.includes(payment.status)) {
      return NextResponse.json(
        { error: 'Invoice can only be downloaded for accepted payments' },
        { status: 400 }
      );
    }

    // Fetch company information with logo using company_id from payment
    const companyId = payment.company_id;
    
    let company;
    let companyError;
    
    if (companyId) {
      const result = await supabase
        .from('companies')
        .select('id, name, logo_url, slug, country, currency')
        .eq('id', companyId)
        .single();
      company = result.data;
      companyError = result.error;
    } else {
      const result = await supabase
        .from('companies')
        .select('id, name, logo_url, slug, country, currency')
        .eq('slug', params.slug)
        .single();
      company = result.data;
      companyError = result.error;
    }

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Fetch website settings for contact information
    const { data: websiteSettings } = await supabase
      .from('website_settings')
      .select('contact_email, contact_phone, contact_location, logo_url')
      .eq('company_id', company.id)
      .single();

    // Use website_settings logo if available, otherwise use company logo
    const companyLogo = websiteSettings?.logo_url || company.logo_url;
    const companyEmail = websiteSettings?.contact_email || null;
    const companyPhone = websiteSettings?.contact_phone || null;
    const companyAddress = websiteSettings?.contact_location || company.country || null;

    // Parse cart items from metadata
    let cartItems: CartItem[] = [];
    if (payment.metadata) {
      try {
        const metadata = typeof payment.metadata === 'string' 
          ? JSON.parse(payment.metadata) 
          : payment.metadata;
        
        if (metadata.cart_items && Array.isArray(metadata.cart_items)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          cartItems = metadata.cart_items.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product_name || 'Product',
            quantity: item.quantity || 1,
            unit_price: parseFloat(item.unit_price || item.price_at_add || 0),
            total_price: parseFloat(item.total_price || (item.quantity * (item.unit_price || item.price_at_add || 0))),
            image: item.image || item.product_image || null,
          }));
        }
      } catch (e) {
        console.error('Error parsing cart items:', e);
      }
    }

    // Calculate subtotal
    const subtotal = cartItems.reduce((sum, item) => sum + item.total_price, 0);

    // Return invoice data for preview
    return NextResponse.json({
      company: {
        name: company.name,
        logo_url: companyLogo,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
      },
      payment: {
        id: payment.id,
        reference_number: payment.reference_number || payment.id.slice(0, 8).toUpperCase(),
        date: new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        amount: parseFloat(payment.amount.toString()),
        currency: payment.currency || 'USD',
        payment_method: payment.payment_method || 'N/A',
        status: payment.status,
        payer_name: payment.payer_name,
        payer_email: payment.payer_email,
        payment_notes: payment.payment_notes,
      },
      items: cartItems,
      subtotal,
      total: parseFloat(payment.amount.toString()),
    });
  } catch (error) {
    console.error('Error generating invoice preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice preview' },
      { status: 500 }
    );
  }
}


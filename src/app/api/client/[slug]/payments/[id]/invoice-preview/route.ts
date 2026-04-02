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

    // Fetch website settings for contact information and invoice customisation
    const { data: websiteSettings } = await supabase
      .from('website_settings')
      .select('contact_email, contact_phone, contact_location, logo_url, primary_color, secondary_color, accent_color, invoice_tax_label, invoice_tax_number, invoice_tax_rate, invoice_payment_terms, invoice_footer_text')
      .eq('company_id', company.id)
      .single();

    // Use website_settings logo if available, otherwise use company logo
    const companyLogo = websiteSettings?.logo_url || company.logo_url;
    const companyEmail = websiteSettings?.contact_email || null;
    const companyPhone = websiteSettings?.contact_phone || null;
    const companyAddress = websiteSettings?.contact_location || company.country || null;
    const primaryColor = websiteSettings?.primary_color || null;
    const taxLabel = (websiteSettings as Record<string, unknown> | null)?.invoice_tax_label as string | null || 'Tax';
    const taxNumber = (websiteSettings as Record<string, unknown> | null)?.invoice_tax_number as string | null || null;
    const taxRate = parseFloat(String((websiteSettings as Record<string, unknown> | null)?.invoice_tax_rate ?? '0')) || 0;
    const paymentTerms = (websiteSettings as Record<string, unknown> | null)?.invoice_payment_terms as string | null || null;
    const footerText = (websiteSettings as Record<string, unknown> | null)?.invoice_footer_text as string | null || null;

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
    const totalAmount = parseFloat(payment.amount.toString());
    const taxAmount = taxRate > 0 ? parseFloat((subtotal * (taxRate / 100)).toFixed(2)) : 0;

    return NextResponse.json({
      company: {
        name: company.name,
        logo_url: companyLogo,
        email: companyEmail,
        phone: companyPhone,
        address: companyAddress,
        primary_color: primaryColor,
        tax_number: taxNumber,
        tax_label: taxLabel,
      },
      invoice: {
        tax_rate: taxRate,
        tax_label: taxLabel,
        tax_amount: taxAmount,
        payment_terms: paymentTerms,
        footer_text: footerText,
      },
      payment: {
        id: payment.id,
        reference_number: payment.reference_number || payment.id.slice(0, 8).toUpperCase(),
        date: new Date(payment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        amount: totalAmount,
        currency: payment.currency || 'USD',
        payment_method: payment.payment_method || 'N/A',
        status: payment.status,
        payer_name: payment.payer_name,
        payer_email: payment.payer_email,
        payment_notes: payment.payment_notes,
      },
      items: cartItems,
      subtotal,
      total: totalAmount,
    });
  } catch (error) {
    console.error('Error generating invoice preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate invoice preview' },
      { status: 500 }
    );
  }
}


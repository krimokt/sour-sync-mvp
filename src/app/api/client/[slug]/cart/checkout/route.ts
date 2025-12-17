import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { payment_method_type, payment_method_id, address_id } = await request.json();

    // Get company by slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug, status')
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

    // Fetch cart with items
    const { data: cart } = await supabaseAdmin
      .from('carts')
      .select(`
        id,
        items:cart_items(
          id,
          product_id,
          quantity,
          price_at_add,
          product:products(id, name, price, images)
        )
      `)
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .maybeSingle();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const items = (cart as any)?.items || [];

    if (!cart || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Compute totals
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalQuantity = items.reduce((sum: number, item: any) => sum + Number(item.quantity || 0), 0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const totalPrice = items.reduce((sum: number, item: any) => {
      const p = Number(item.product?.price ?? item.price_at_add ?? 0);
      return sum + p * Number(item.quantity || 0);
    }, 0);

    // Get delivery address if provided
    let addressNote = '';
    let destinationCountry = 'TBD';
    let destinationCity = 'TBD';
    
    if (address_id) {
      const { data: address } = await supabaseAdmin
        .from('client_addresses')
        .select('*')
        .eq('id', address_id)
        .eq('user_id', user.id)
        .eq('company_id', company.id)
        .single();
      
      if (address) {
        destinationCountry = address.country || 'TBD';
        destinationCity = address.city || 'TBD';
        const addressLines = [
          address.full_name || 'N/A',
          address.company_name,
          address.address_line_1,
          address.address_line_2,
        ].filter(Boolean).join(', ');
        const addressParts = [
          `Delivery Address: ${addressLines}`,
          address.country ? `Country: ${address.country}` : null,
          address.city ? `City: ${address.city}` : null,
          address.phone ? `Phone: ${address.phone}` : null,
        ].filter(Boolean);
        addressNote = addressParts.join('\n');
      }
    }

    // Build payment method note
    let paymentNote = '';
    if (payment_method_type && payment_method_id) {
      if (payment_method_type === 'bank') {
        const { data: bankAccount } = await supabaseAdmin
          .from('bank_accounts')
          .select('bank_name, account_number, currency')
          .eq('id', payment_method_id)
          .single();
        if (bankAccount) {
          paymentNote = `Payment Method: Bank Transfer - ${bankAccount.bank_name} (${bankAccount.account_number}) - ${bankAccount.currency}`;
        }
      } else if (payment_method_type === 'crypto') {
        const { data: cryptoWallet } = await supabaseAdmin
          .from('crypto_wallets')
          .select('wallet_name, cryptocurrency, network')
          .eq('id', payment_method_id)
          .single();
        if (cryptoWallet) {
          paymentNote = `Payment Method: Cryptocurrency - ${cryptoWallet.wallet_name} (${cryptoWallet.cryptocurrency}${cryptoWallet.network ? ` - ${cryptoWallet.network}` : ''})`;
        }
      }
    }

    // Create quotation (cart order)
    const quotation_id = `QT-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;

    const productNameSummary = items
      .slice(0, 3)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => `${it.product?.name || 'Product'} x${it.quantity}`)
      .join(', ');

    const images: string[] = items
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((it: any) => (Array.isArray(it.product?.images) ? it.product.images[0] : null))
      .filter(Boolean);

    const cartSummary = JSON.stringify(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      items.map((it: any) => ({
        product_id: it.product_id,
        name: it.product?.name,
        quantity: it.quantity,
        unit_price: it.product?.price ?? it.price_at_add,
      }))
    );

    const { data: quotation, error: quotationError } = await supabaseAdmin
      .from('quotations')
      .insert({
        quotation_id,
        company_id: company.id,
        user_id: user.id,
        product_name: `Cart Order: ${productNameSummary}${items.length > 3 ? '…' : ''}`,
        quantity: totalQuantity,
        status: 'Pending',
        service_type: 'Cart Order',
        destination_country: destinationCountry,
        destination_city: destinationCity,
        shipping_method: 'TBD',
        image_urls: images,
        product_images: images,
        total_price_option1: totalPrice.toString(),
        description_option1: [addressNote, paymentNote, `Cart Items: ${cartSummary}`].filter(Boolean).join('\n\n'),
      })
      .select()
      .single();

    if (quotationError) {
      console.error('Error creating cart quotation:', quotationError);
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
    }

    // Create payment record
    const referenceNumber = `PAY-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`;

    // Get payment method details for payment record
    let paymentMethodName = 'Bank Transfer';
    if (payment_method_type === 'bank') {
      const { data: bankAccount } = await supabaseAdmin
        .from('bank_accounts')
        .select('bank_name, account_number, currency')
        .eq('id', payment_method_id)
        .single();
      if (bankAccount) {
        paymentMethodName = `${bankAccount.bank_name} - ${bankAccount.account_number}`;
      }
    } else if (payment_method_type === 'crypto') {
      const { data: cryptoWallet } = await supabaseAdmin
        .from('crypto_wallets')
        .select('wallet_name, cryptocurrency, network')
        .eq('id', payment_method_id)
        .single();
      if (cryptoWallet) {
        paymentMethodName = `${cryptoWallet.wallet_name} (${cryptoWallet.cryptocurrency}${cryptoWallet.network ? ` - ${cryptoWallet.network}` : ''})`;
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cartItemsData = items.map((it: any) => ({
      product_id: it.product_id,
      product_name: it.product?.name || 'Product',
      quantity: it.quantity,
      unit_price: Number(it.product?.price ?? it.price_at_add ?? 0),
      total_price: Number(it.product?.price ?? it.price_at_add ?? 0) * Number(it.quantity || 0),
      image: Array.isArray(it.product?.images) ? it.product.images[0] : null,
    }));

    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .insert({
        user_id: user.id,
        company_id: company.id,
        amount: totalPrice,
        currency: 'USD',
        payment_method: paymentMethodName,
        status: 'pending',
        reference_number: referenceNumber,
        payment_notes: [addressNote, paymentNote].filter(Boolean).join('\n\n') || null,
        metadata: {
          company_id: company.id,
          quotation_id: quotation.id,
          cart_items: cartItemsData,
          address_id: address_id,
          payment_method_type: payment_method_type,
          payment_method_id: payment_method_id,
        },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
      .select()
      .single();

    if (paymentError) {
      console.error('Error creating payment:', paymentError);
      // Don't fail the checkout if payment creation fails, but log it
    }

    // Clear cart
    const { error: clearError } = await supabaseAdmin
      .from('cart_items')
      .delete()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .eq('cart_id', (cart as any).id);

    if (clearError) {
      console.error('Error clearing cart:', clearError);
      // Order succeeded; cart clear failure is non-fatal.
    }

    return NextResponse.json({
      success: true,
      quotation,
      payment: payment || null,
      message:
        'The order is now in the payment page. The payment department will review your order payment.',
    });
  } catch (error) {
    console.error('Cart checkout error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}





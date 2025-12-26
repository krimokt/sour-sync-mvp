import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Get client cart
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
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check authentication
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'You are not authorized' },
        { status: 403 }
      );
    }

    // Find or create cart for this client
    let { data: cart } = await supabaseAdmin
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          product:products(*)
        )
      `)
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!cart) {
      // Create new cart
      const { data: newCart, error: createError } = await supabaseAdmin
        .from('carts')
        .insert({
          company_id: company.id,
          user_id: user.id,
        })
        .select(`
          *,
          items:cart_items(
            *,
            product:products(*)
          )
        `)
        .single();

      if (createError) {
        console.error('Cart creation error in GET:', createError);
        return NextResponse.json(
          { error: 'Failed to create cart', details: createError.message },
          { status: 500 }
        );
      }
      cart = newCart;
    }

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Add item to cart
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { product_id, quantity = 1 } = await request.json();

    if (!product_id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
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
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check authentication
    const cookieStore = await cookies();
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
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
      return NextResponse.json(
        { error: 'You are not authorized' },
        { status: 403 }
      );
    }

    // Get product
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('company_id', company.id)
      .eq('is_published', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found or not available' },
        { status: 404 }
      );
    }

    // Find or create cart
    let { data: cart } = await supabaseAdmin
      .from('carts')
      .select('*')
      .eq('company_id', company.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (!cart) {
      const { data: newCart, error: createError } = await supabaseAdmin
        .from('carts')
        .insert({
          company_id: company.id,
          user_id: user.id,
        })
        .select()
        .single();

      if (createError) {
        console.error('Cart creation error in POST:', createError);
        return NextResponse.json(
          { error: 'Failed to create cart', details: createError.message },
          { status: 500 }
        );
      }
      cart = newCart;
    }

    // Check if item already in cart
    const { data: existingItem } = await supabaseAdmin
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existingItem) {
      // Update quantity
      const { error: updateError } = await supabaseAdmin
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);

      if (updateError) {
        return NextResponse.json(
          { error: 'Failed to update cart' },
          { status: 500 }
        );
      }
    } else {
      // Add new item
      const { error: insertError } = await supabaseAdmin
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id,
          quantity,
          price_at_add: Number(product.price),
        });

      if (insertError) {
        return NextResponse.json(
          { error: 'Failed to add to cart' },
          { status: 500 }
        );
      }
    }

    // Return updated cart
    const { data: updatedCart } = await supabaseAdmin
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          product:products(*)
        )
      `)
      .eq('id', cart.id)
      .single();

    return NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Product added to cart',
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}












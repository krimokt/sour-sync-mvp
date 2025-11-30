import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Get or create cart
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get user from token or session
    const authHeader = request.headers.get('authorization');
    const sessionId = request.headers.get('x-session-id');
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        // Invalid token, continue with session
      }
    }

    // Find existing cart
    let cartQuery = supabase
      .from('carts')
      .select(`
        *,
        items:cart_items(
          *,
          product:products(*)
        )
      `)
      .eq('company_id', company.id);

    if (userId) {
      cartQuery = cartQuery.eq('user_id', userId);
    } else if (sessionId) {
      cartQuery = cartQuery.eq('session_id', sessionId);
    } else {
      // No cart identifier
      return NextResponse.json({ cart: null });
    }

    const { data: cart } = await cartQuery.single();

    return NextResponse.json({ cart });
  } catch (error) {
    console.error('Cart GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// Add item to cart
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { product_id, quantity = 1 } = await request.json();

    if (!product_id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    // Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', params.slug)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 });
    }

    // Get product
    const { data: product } = await supabase
      .from('products')
      .select('*')
      .eq('id', product_id)
      .eq('company_id', company.id)
      .eq('is_active', true)
      .single();

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get user from token or session
    const authHeader = request.headers.get('authorization');
    const sessionId = request.headers.get('x-session-id') || crypto.randomUUID();
    let userId: string | null = null;

    if (authHeader?.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
        userId = decoded.userId;
      } catch (e) {
        // Invalid token
      }
    }

    // Find or create cart
    let cartQuery = supabase
      .from('carts')
      .select('*')
      .eq('company_id', company.id);

    if (userId) {
      cartQuery = cartQuery.eq('user_id', userId);
    } else {
      cartQuery = cartQuery.eq('session_id', sessionId);
    }

    let { data: cart } = await cartQuery.single();

    if (!cart) {
      const { data: newCart, error: createError } = await supabase
        .from('carts')
        .insert({
          company_id: company.id,
          user_id: userId,
          session_id: userId ? null : sessionId,
        })
        .select()
        .single();

      if (createError) {
        return NextResponse.json({ error: 'Failed to create cart' }, { status: 500 });
      }
      cart = newCart;
    }

    // Check if item already in cart
    const { data: existingItem } = await supabase
      .from('cart_items')
      .select('*')
      .eq('cart_id', cart.id)
      .eq('product_id', product_id)
      .single();

    if (existingItem) {
      // Update quantity
      await supabase
        .from('cart_items')
        .update({ quantity: existingItem.quantity + quantity })
        .eq('id', existingItem.id);
    } else {
      // Add new item
      await supabase
        .from('cart_items')
        .insert({
          cart_id: cart.id,
          product_id,
          quantity,
          price_at_add: product.price || 0,
        });
    }

    // Return updated cart
    const { data: updatedCart } = await supabase
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

    const response = NextResponse.json({ cart: updatedCart, session_id: sessionId });
    
    return response;
  } catch (error) {
    console.error('Cart POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}





import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { first_name, last_name, email, phone, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Get company by slug
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Store not found' },
        { status: 404 }
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('store_users')
      .select('id')
      .eq('company_id', company.id)
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('store_users')
      .insert({
        company_id: company.id,
        email: email.toLowerCase(),
        password_hash,
        first_name: first_name || null,
        last_name: last_name || null,
        phone: phone || null,
      })
      .select()
      .single();

    if (createError) {
      console.error('Create user error:', createError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: newUser.id,
        companyId: company.id,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    const { password_hash: _, ...safeUser } = newUser;

    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}


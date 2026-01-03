import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { parseWithSchema, readJson, slugSchema, ValidationError } from '@/lib/validation';
import { getClientIp, rateLimit } from '@/lib/ratelimit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  return secret;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Rate limit login attempts (by IP)
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'store_login', ip }, { limit: 10, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many attempts. Please try again later.' }, { status: 429 });
    }

    const { slug } = parseWithSchema(z.object({ slug: slugSchema }), await params);
    const raw = await readJson(request);
    const { email, password } = parseWithSchema(
      z.object({
        email: z.string().email().max(320),
        password: z.string().min(6).max(200),
      }),
      raw
    );

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

    // Find user by email and company
    const { data: user, error: userError } = await supabase
      .from('store_users')
      .select('*')
      .eq('company_id', company.id)
      .eq('email', email.toLowerCase())
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Account is disabled' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await supabase
      .from('store_users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        companyId: company.id,
        email: user.email,
      },
      getJwtSecret(),
      { expiresIn: '7d' }
    );

    // Return user data (without password)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password_hash: _, ...safeUser } = user;

    return NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Invalid request', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during login';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


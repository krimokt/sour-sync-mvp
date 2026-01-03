import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import { parseWithSchema, readJson, slugSchema, uuidSchema, ValidationError } from '@/lib/validation';
import { getClientIp, rateLimit } from '@/lib/ratelimit';

const bodySchema = z
  .object({
    status: z.string().min(1).max(50).optional(),
    selected_option: z.number().int().min(1).max(3).optional(),
    quotation_fees: z.string().max(100).optional(),

    // Price option fields (strings)
    title_option1: z.string().max(500).optional(),
    total_price_option1: z.string().max(100).optional(),
    price_per_unit_option1: z.string().max(100).optional(),
    delivery_time_option1: z.string().max(100).optional(),
    description_option1: z.string().max(5000).optional(),
    image_option1: z.string().max(20000).optional(),
    price_description_option1: z.string().max(5000).optional(),

    title_option2: z.string().max(500).optional(),
    total_price_option2: z.string().max(100).optional(),
    price_per_unit_option2: z.string().max(100).optional(),
    delivery_time_option2: z.string().max(100).optional(),
    description_option2: z.string().max(5000).optional(),
    image_option2: z.string().max(20000).optional(),
    price_description_option2: z.string().max(5000).optional(),

    title_option3: z.string().max(500).optional(),
    total_price_option3: z.string().max(100).optional(),
    price_per_unit_option3: z.string().max(100).optional(),
    delivery_time_option3: z.string().max(100).optional(),
    description_option3: z.string().max(5000).optional(),
    image_option3: z.string().max(20000).optional(),
    price_description_option3: z.string().max(5000).optional(),
  })
  .strict();

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    const { slug, id } = parseWithSchema(
      z.object({ slug: slugSchema, id: uuidSchema }),
      params
    );

    const raw = await readJson(request);
    const updateData = parseWithSchema(bodySchema, raw);

    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limit staff updates (by user + IP)
    const ip = getClientIp(request);
    const rl = await rateLimit({ route: 'store_quotation_price_options', userId: user.id, ip }, { limit: 60, window: '1 m' });
    if (!rl.ok) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    // Resolve company by slug
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Verify staff membership for this store
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id, role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile?.company_id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (profile.company_id !== company.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const dataToUpdate: Record<string, unknown> = {
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    // Tenant-bound update (extra guard even though RLS exists)
    const { error } = await supabase
      .from('quotations')
      .update(dataToUpdate)
      .eq('id', id)
      .eq('company_id', company.id);

    if (error) {
      console.error('Error updating quotation price options:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Price options saved successfully' 
    }, { status: 200 });

  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { error: 'Invalid request', issues: error.issues },
        { status: 400 }
      );
    }
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}


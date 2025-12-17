import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from '@/types/supabase';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Update payment status (for admin approval/rejection)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const { status } = await request.json();

    if (!status || !['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status. Must be pending, approved, or rejected' }, { status: 400 });
    }

    // Get company by slug
    const { data: company, error: companyError } = await supabaseAdmin
      .from('companies')
      .select('id, slug')
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

    // Get payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('payments')
      .select('*, metadata')
      .eq('id', id)
      .single();

    if (paymentError || !payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify payment belongs to this company (from metadata)
    const paymentMetadata = payment.metadata as any;
    if (paymentMetadata?.company_id !== company.id) {
      return NextResponse.json({ error: 'Payment not found for this company' }, { status: 404 });
    }

    // Update payment status
    const { data: updatedPayment, error: updateError } = await supabaseAdmin
      .from('payments')
      .update({ status } as any)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return NextResponse.json({ error: 'Failed to update payment status' }, { status: 500 });
    }

    // If status is approved, create shipping record
    if (status === 'approved' && paymentMetadata?.quotation_id) {
      // Get quotation details for shipping
      const { data: quotation } = await supabaseAdmin
        .from('quotations')
        .select('id, destination_country, destination_city')
        .eq('id', paymentMetadata.quotation_id)
        .single();

      const { error: shippingError } = await supabaseAdmin
        .from('shipping')
        .insert({
          user_id: payment.user_id,
          company_id: company.id,
          quotation_id: paymentMetadata.quotation_id,
          status: 'processing',
          location: quotation?.destination_city || 'Processing',
        } as any);

      if (shippingError) {
        console.error('Error creating shipping record:', shippingError);
        // Don't fail the payment update if shipping creation fails
      }
    }

    return NextResponse.json({ success: true, payment: updatedPayment });
  } catch (error) {
    console.error('Update payment status error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}





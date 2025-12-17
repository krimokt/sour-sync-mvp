import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  try {
    const { slug, id } = await params;
    const supabase = createRouteHandlerClient({ cookies });
    const { status } = await request.json();

    // Validate status - must match database constraint
    // Allowed: 'Pending', 'Accepted', 'Rejected', 'pending', 'processing', 'completed', 'failed'
    const validStatuses = ['Pending', 'Accepted', 'Rejected', 'pending', 'processing', 'completed', 'failed'];
    const normalizedStatus = status.toLowerCase();
    
    // Map common status names to database values
    let dbStatus = status;
    if (normalizedStatus === 'approved') {
      dbStatus = 'Accepted';
    } else if (normalizedStatus === 'rejected') {
      dbStatus = 'Rejected';
    } else if (normalizedStatus === 'pending') {
      dbStatus = 'pending';
    }
    
    if (!validStatuses.includes(dbStatus)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, approved, rejected, completed, failed' },
        { status: 400 }
      );
    }

    // Get the payment to check company_id
    const { data: payment, error: fetchError } = await supabase
      .from('payments')
      .select('id, company_id, metadata, quotation_ids, user_id, payer_name')
      .eq('id', id)
      .single();

    if (fetchError || !payment) {
      console.error('Payment fetch error:', fetchError);
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Get company by slug to verify
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', slug)
      .single();

    if (companyError || !company) {
      console.error('Company fetch error:', companyError);
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    if (payment.company_id !== company.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update payment status
    const { error: updateError } = await supabase
      .from('payments')
      .update({ status: dbStatus })
      .eq('id', id);

    if (updateError) {
      console.error('Error updating payment status:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // If status is approved/accepted, create shipping record
    if (dbStatus === 'Accepted' || normalizedStatus === 'approved') {
      // Check if shipping record already exists for this payment
      const { data: existingShipping } = await supabase
        .from('shipping')
        .select('id, metadata, payment_id, tracking_number')
        .eq('payment_id', payment.id)
        .single();

      if (!existingShipping) {
        // Generate unique tracking number
        const generateTrackingNumber = () => {
          const prefix = 'SS'; // SourSync prefix
          const timestamp = Date.now().toString(36).toUpperCase().slice(-6); // Last 6 chars of timestamp in base36
          const random = Math.random().toString(36).substring(2, 6).toUpperCase(); // 4 random chars
          return `${prefix}-${timestamp}-${random}`;
        };

        let trackingNumber = generateTrackingNumber();
        
        // Ensure uniqueness by checking if it exists
        let attempts = 0;
        while (attempts < 10) {
          const { data: existing } = await supabase
            .from('shipping')
            .select('id')
            .eq('tracking_number', trackingNumber)
            .single();
          
          if (!existing) break; // Unique tracking number found
          trackingNumber = generateTrackingNumber(); // Generate new one
          attempts++;
        }
        // Parse payment metadata to get cart items and address
        let paymentMetadata = payment.metadata;
        if (typeof paymentMetadata === 'string') {
          try {
            paymentMetadata = JSON.parse(paymentMetadata);
          } catch (e) {
            paymentMetadata = null;
          }
        }

        // Get address details from metadata
        let receiverName = '';
        let receiverPhone = '';
        let receiverAddress = '';
        let location = 'Unknown';
        
        if (paymentMetadata?.address_id) {
          // Try to get address from client_addresses
          const { data: address } = await supabase
            .from('client_addresses')
            .select('full_name, phone, address_line_1, address_line_2, city, country')
            .eq('id', paymentMetadata.address_id)
            .single();

          if (address) {
            receiverName = address.full_name || '';
            receiverPhone = address.phone || '';
            const addressParts = [
              address.address_line_1,
              address.address_line_2,
              address.city,
              address.country
            ].filter(Boolean);
            receiverAddress = addressParts.join(', ');
            location = address.city || address.country || 'Unknown';
          }
        }

        // Get quotation details for location if available
        let quotationId = null;
        if (payment.quotation_ids && Array.isArray(payment.quotation_ids) && payment.quotation_ids.length > 0) {
          quotationId = payment.quotation_ids[0]; // Use first quotation for reference
          
          const { data: quotation } = await supabase
            .from('quotations')
            .select('destination_city, user_id')
            .eq('id', quotationId)
            .single();

          if (quotation && quotation.destination_city) {
            location = quotation.destination_city;
          }
        } else if (paymentMetadata?.quotation_id) {
          quotationId = paymentMetadata.quotation_id;
          
          const { data: quotation } = await supabase
            .from('quotations')
            .select('destination_city, user_id')
            .eq('id', quotationId)
            .single();

          if (quotation && quotation.destination_city) {
            location = quotation.destination_city;
          }
        }

        // Create ONE shipping record for the entire payment (all cart items grouped together)
        const { error: shippingError } = await supabase
          .from('shipping')
          .insert({
            user_id: payment.user_id,
            company_id: company.id,
            quotation_id: quotationId,
            payment_id: payment.id,
            tracking_number: trackingNumber,
            status: 'processing',
            location: location,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            receiver_name: receiverName || (payment as any).payer_name || null,
            receiver_phone: receiverPhone || null,
            receiver_address: receiverAddress || null,
            metadata: paymentMetadata || null, // Store full payment metadata including ALL cart_items
          });

        if (shippingError) {
          console.error('Error creating shipping record:', shippingError);
          // Don't fail the request if shipping creation fails
        }
      } else {
        // Update existing shipping record with metadata and tracking number if needed
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};
        
        if (!existingShipping.metadata || !existingShipping.payment_id) {
          let paymentMetadata = payment.metadata;
          if (typeof paymentMetadata === 'string') {
            try {
              paymentMetadata = JSON.parse(paymentMetadata);
            } catch (e) {
              paymentMetadata = null;
            }
          }
          updateData.payment_id = payment.id;
          updateData.metadata = paymentMetadata || null;
        }

        // Generate tracking number if it doesn't exist
        if (!existingShipping.tracking_number) {
          const generateTrackingNumber = () => {
            const prefix = 'SS'; // SourSync prefix
            const timestamp = Date.now().toString(36).toUpperCase().slice(-6);
            const random = Math.random().toString(36).substring(2, 6).toUpperCase();
            return `${prefix}-${timestamp}-${random}`;
          };

          let trackingNumber = generateTrackingNumber();
          
          // Ensure uniqueness
          let attempts = 0;
          while (attempts < 10) {
            const { data: existing } = await supabase
              .from('shipping')
              .select('id')
              .eq('tracking_number', trackingNumber)
              .single();
            
            if (!existing) break;
            trackingNumber = generateTrackingNumber();
            attempts++;
          }
          
          updateData.tracking_number = trackingNumber;
        }

        if (Object.keys(updateData).length > 0) {
          await supabase
            .from('shipping')
            .update(updateData)
            .eq('id', existingShipping.id);
        }
      }
    }

    return NextResponse.json({ success: true, status: dbStatus });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}





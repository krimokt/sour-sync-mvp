import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables.");
}

const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: { persistSession: false }
  }
);

export async function PATCH(
  request: Request,
  { params }: { params: { slug: string; id: string } }
) {
  try {
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    const updateData = await request.json();
    const quotationId = params.id;

    if (!quotationId) {
      return NextResponse.json(
        { error: "Quotation ID is required" },
        { status: 400 }
      );
    }

    // Optimized: Prepare update data - only process fields that are provided
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: any = {
      updated_at: new Date().toISOString(),
    };

    // Add status if not already set
    if (updateData.status) {
      dataToUpdate.status = updateData.status;
    }

    // Process all fields from updateData (client already filtered empty values)
    Object.keys(updateData).forEach(key => {
      if (key === 'updated_at' || key === 'status') return; // Already handled
      
      const value = updateData[key];
      
      // Handle selected_option specially
      if (key === 'selected_option') {
        if (typeof value === 'number' && value >= 1 && value <= 3) {
          dataToUpdate.selected_option = value;
        } else {
          dataToUpdate.selected_option = null;
        }
        return;
      }

      // For all other fields, use value as-is (client already processed them)
      if (value !== null && value !== undefined && value !== '') {
        dataToUpdate[key] = value;
      }
    });

    // Optimized: Update and return immediately without fetching data back
    const { error } = await supabaseAdmin
      .from('quotations')
      .update(dataToUpdate)
      .eq('id', quotationId);

    if (error) {
      console.error('Error updating quotation price options:', error);
      console.error('Update data keys:', Object.keys(dataToUpdate));
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    // Return success immediately without fetching data (faster response)
    return NextResponse.json({ 
      success: true, 
      message: 'Price options saved successfully' 
    }, { status: 200 });

  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
      },
      { status: 500 }
    );
  }
}


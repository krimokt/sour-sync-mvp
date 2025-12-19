import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken } from '@/lib/magic-link';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to validate token and get magic link data
async function validateToken(token: string) {
  const tokenHash = hashToken(token);
  
  const { data: magicLink, error } = await supabaseAdmin
    .from('client_magic_links')
    .select('id, company_id, client_id, scopes, expires_at, revoked_at, max_uses, use_count')
    .eq('token_hash', tokenHash)
    .single();

  if (error || !magicLink) {
    return { valid: false, error: 'Invalid token' };
  }

  if (new Date() > new Date(magicLink.expires_at)) {
    return { valid: false, error: 'Token expired' };
  }

  if (magicLink.revoked_at) {
    return { valid: false, error: 'Token revoked' };
  }

  if (magicLink.max_uses !== null && magicLink.use_count >= magicLink.max_uses) {
    return { valid: false, error: 'Token max uses reached' };
  }

  return { valid: true, magicLink };
}

// Get quotation details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { token, id } = await params;
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const { magicLink } = validation;

    // Get quotation
    const { data: quotation, error } = await supabaseAdmin
      .from('quotations')
      .select('*')
      .eq('id', id)
      .eq('company_id', magicLink.company_id)
      .single();

    if (error || !quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quotation });
  } catch (error) {
    console.error('Get quotation error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Update quotation (approve/confirm)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string; id: string }> }
) {
  try {
    const { token, id } = await params;
    const validation = await validateToken(token);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 403 }
      );
    }

    const { magicLink } = validation;
    const body = await request.json();
    const { status, selected_option } = body;

    // Get quotation first to verify ownership
    const { data: quotation } = await supabaseAdmin
      .from('quotations')
      .select('id, company_id, status')
      .eq('id', id)
      .eq('company_id', magicLink.company_id)
      .single();

    if (!quotation) {
      return NextResponse.json(
        { error: 'Quotation not found' },
        { status: 404 }
      );
    }

    // Update quotation
    const updateData: Record<string, unknown> = {};
    if (status) {
      // Only allow certain status transitions
      const allowedStatuses = ['Approved', 'Confirmed', 'Rejected'];
      if (allowedStatuses.includes(status)) {
        updateData.status = status;
      }
    }
    if (selected_option !== undefined) {
      updateData.selected_option = parseInt(selected_option.toString());
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      );
    }

    const { data: updatedQuotation, error: updateError } = await supabaseAdmin
      .from('quotations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating quotation:', updateError);
      return NextResponse.json(
        { error: `Failed to update quotation: ${updateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Quotation updated successfully',
      quotation: updatedQuotation,
    });
  } catch (error) {
    console.error('Update quotation error:', error);
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


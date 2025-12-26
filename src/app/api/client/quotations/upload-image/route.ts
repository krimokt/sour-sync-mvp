import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hashToken, verifyToken } from '@/lib/magic-link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validate token and get client data
async function validateTokenAndGetClient(token: string) {
  try {
    // Hash the token to look it up
    const tokenHash = hashToken(token);
    
    // Find the magic link by token hash
    const { data: magicLink, error: linksError } = await supabase
      .from('client_magic_links')
      .select('*')
      .eq('token_hash', tokenHash)
      .is('revoked_at', null)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (linksError || !magicLink) {
      return null;
    }

    // Verify the token matches (double check with timing-safe comparison)
    if (!verifyToken(token, magicLink.token_hash)) {
      return null;
    }

    const validLink = magicLink;

    const expiresAt = new Date(validLink.expires_at);
    if (expiresAt < new Date() || validLink.revoked_at) {
      return null;
    }

    const { data: client } = await supabase
      .from('clients')
      .select('*')
      .eq('id', validLink.client_id)
      .single();

    return client ? { client, magicLink: validLink } : null;
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const token = formData.get('token') as string;
    const file = formData.get('file') as File;

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      );
    }

    // Validate token
    const validationResult = await validateTokenAndGetClient(token);
    if (!validationResult) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Upload file to Supabase storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `quotation_images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('quotation_images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload image: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('quotation_images')
      .getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      url: publicUrl,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}











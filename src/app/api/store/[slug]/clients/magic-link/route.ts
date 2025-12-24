import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Generate a secure random token
function generateToken(): string {
  // Generate 32 random bytes and encode as base64url (URL-safe)
  const bytes = randomBytes(32);
  return bytes.toString('base64url');
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await request.json();
    const { name, phone_e164, email, staffUserId } = body;

    // Validate required fields
    if (!name || !phone_e164) {
      return NextResponse.json(
        { error: 'Name and phone number are required' },
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
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if client already exists (by company_id + phone_e164)
    let client;
    const { data: existingClient } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', company.id)
      .eq('phone_e164', phone_e164)
      .maybeSingle();

    if (existingClient) {
      // Update existing client info if provided
      client = existingClient;
      if (name && name !== client.name) {
        const { data: updatedClient } = await supabase
          .from('clients')
          .update({ name, email: email || client.email })
          .eq('id', client.id)
          .select()
          .single();
        if (updatedClient) client = updatedClient;
      }
    } else {
      // Create new client
      // We need to create an auth user first since user_id is required
      
      // Generate a unique email if not provided
      const clientEmail = email || `${phone_e164.replace(/[^0-9]/g, '')}@client.${company.id.slice(0, 8)}.temp`;
      
      // Create auth user for the client
      let authUserId: string | null = null;
      
      try {
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: clientEmail,
          phone: phone_e164,
          email_confirm: true,
          user_metadata: {
            name,
            phone_e164,
            is_client: true,
          },
        });

        if (authError) {
          // If user already exists, try to find them
          if (authError.message.includes('already registered') || authError.message.includes('User already registered')) {
            // Try to get user by email (more efficient than listing all users)
            try {
              const { data: existingUsers, error: listError } = await supabase.auth.admin.listUsers({
                page: 1,
                perPage: 1000,
              });
              
              if (!listError && existingUsers?.users) {
                const existingUser = existingUsers.users.find(
                  u => u.email === clientEmail || u.phone === phone_e164
                );
                if (existingUser) {
                  authUserId = existingUser.id;
                }
              }
              
              // If still not found, try searching by email pattern
              if (!authUserId && existingUsers?.users) {
                const emailPattern = clientEmail.split('@')[0];
                const existingUser = existingUsers.users.find(
                  u => u.email?.includes(emailPattern) || u.phone === phone_e164
                );
                if (existingUser) {
                  authUserId = existingUser.id;
                }
              }
            } catch (listErr) {
              console.error('Error listing users:', listErr);
            }
            
            if (!authUserId) {
              console.error('User already registered but not found:', authError);
              return NextResponse.json(
                { error: 'A client account with this phone number or email already exists. Please use the existing client or contact support.' },
                { status: 400 }
              );
            }
          } else {
            console.error('Error creating auth user:', authError);
            return NextResponse.json(
              { error: `Failed to create client account: ${authError.message}` },
              { status: 500 }
            );
          }
        } else if (authUser?.user?.id) {
          authUserId = authUser.user.id;
        } else {
          console.error('Auth user created but no user ID returned');
          return NextResponse.json(
            { error: 'Failed to create client account. Please try again.' },
            { status: 500 }
          );
        }
      } catch (authErr) {
        console.error('Unexpected error creating auth user:', authErr);
        return NextResponse.json(
          { error: 'Failed to create client account. Please try again.' },
          { status: 500 }
        );
      }

      if (!authUserId) {
        return NextResponse.json(
          { error: 'Failed to create client account. Please contact support.' },
          { status: 500 }
        );
      }

      // Create client record
      const { data: newClient, error: createError } = await supabase
        .from('clients')
        .insert({
          company_id: company.id,
          user_id: authUserId,
          name,
          phone_e164,
          email: email || null,
          status: 'active',
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating client:', createError);
        // Clean up auth user if client creation fails
        if (authUserId) {
          try {
            await supabase.auth.admin.deleteUser(authUserId);
          } catch (cleanupErr) {
            console.error('Error cleaning up auth user:', cleanupErr);
          }
        }
        return NextResponse.json(
          { error: `Failed to create client: ${createError.message || 'Database error'}` },
          { status: 500 }
        );
      }

      client = newClient;
    }

    // Generate secure token
    const token = generateToken();
    const tokenHash = await bcrypt.hash(token, 10);

    // Set expiry (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Create magic link record
    // quotation_id is nullable to support general client portal access (not tied to a specific quotation)
    const { data: magicLink, error: linkError } = await supabase
      .from('client_magic_links')
      .insert({
        company_id: company.id,
        client_id: client.id,
        quotation_id: null, // NULL for general client portal access
        token_hash: tokenHash,
        expires_at: expiresAt.toISOString(),
        client_name_snapshot: client.name || name,
        client_phone_snapshot: client.phone_e164 || phone_e164,
        created_by: staffUserId || null,
      })
      .select()
      .single();

    if (linkError) {
      console.error('Error creating magic link:', linkError);
      return NextResponse.json(
        { error: `Failed to create magic link: ${linkError.message || 'Database error'}` },
        { status: 500 }
      );
    }

    // Generate the magic link URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const magicLinkUrl = `${baseUrl}/c/${token}`;

    return NextResponse.json({
      success: true,
      magicLink: {
        id: magicLink.id,
        url: magicLinkUrl,
        token: token, // Return token only in API response
        expiresAt: expiresAt.toISOString(),
      },
      client: {
        id: client.id,
        name: client.name,
        phone_e164: client.phone_e164,
        email: client.email,
      },
    });
  } catch (error) {
    console.error('Magic link generation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error details:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}


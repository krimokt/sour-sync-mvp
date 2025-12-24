import { createClient } from '@supabase/supabase-js';
import { hashToken, validateMagicLink } from '@/lib/magic-link';
import { MagicLinkProvider } from '@/components/portal/MagicLinkProvider';
import InvalidTokenPage from '@/components/portal/InvalidTokenPage';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface PortalLayoutProps {
  children: React.ReactNode;
  params: Promise<{ token: string }>;
}

export default async function PortalLayout({ children, params }: PortalLayoutProps) {
  const { token } = await params;

  if (!token) {
    return <InvalidTokenPage error="Token is required" />;
  }

  // Hash the token to look it up
  const tokenHash = hashToken(token);

  // Find the magic link
  const { data: magicLink, error: magicLinkError } = await supabaseAdmin
    .from('client_magic_links')
    .select(`
      id,
      company_id,
      client_id,
      token_hash,
      expires_at,
      revoked_at,
      max_uses,
      use_count,
      scopes,
      client_name_snapshot,
      client_phone_snapshot,
      companies (
        id,
        name,
        slug,
        logo_url
      ),
      clients (
        id,
        name,
        phone_e164,
        email,
        company_name
      )
    `)
    .eq('token_hash', tokenHash)
    .single();

  if (magicLinkError || !magicLink) {
    return <InvalidTokenPage error="Invalid or expired magic link" />;
  }

  // Validate the magic link
  const validation = validateMagicLink(magicLink);
  if (!validation.valid) {
    return <InvalidTokenPage error={validation.error || 'Magic link is invalid'} />;
  }

  // Update access tracking
  await supabaseAdmin
    .from('client_magic_links')
    .update({
      last_accessed_at: new Date().toISOString(),
      use_count: (magicLink.use_count || 0) + 1,
    })
    .eq('id', magicLink.id);

  // Extract company and client data
  const company = Array.isArray(magicLink.companies) 
    ? magicLink.companies[0] 
    : magicLink.companies;
  const client = Array.isArray(magicLink.clients)
    ? magicLink.clients[0]
    : magicLink.clients;

  const magicLinkData = {
    magicLinkId: magicLink.id,
    companyId: magicLink.company_id,
    clientId: magicLink.client_id,
    companyName: (company as { name?: string })?.name || 'Company',
    clientName: magicLink.client_name_snapshot,
    clientPhone: magicLink.client_phone_snapshot,
    scopes: magicLink.scopes || ['view', 'pay', 'track'],
    company: company,
    client: client,
  };

  return (
    <MagicLinkProvider token={token} initialData={magicLinkData}>
      {children}
    </MagicLinkProvider>
  );
}


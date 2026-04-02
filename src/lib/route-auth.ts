import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type AuthSuccess = {
  ok: true;
  user: { id: string };
  profile: { id: string; company_id: string | null; role: string | null };
  company: { id: string; slug: string };
};

type AuthFailure = {
  ok: false;
  response: NextResponse;
};

/**
 * Verifies that the request is from an authenticated user who belongs to the
 * given company slug and (optionally) holds one of the required roles.
 *
 * Returns `{ ok: true, user, profile, company }` on success, or
 * `{ ok: false, response }` — the caller should return `auth.response` immediately.
 */
export async function requireCompanyMember(
  request: NextRequest,
  slug: string,
  allowedRoles?: string[]
): Promise<AuthSuccess | AuthFailure> {
  const cookieStore = await cookies();
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  // Resolve company by slug
  const { data: company, error: companyError } = await supabaseAdmin
    .from('companies')
    .select('id, slug')
    .eq('slug', slug)
    .single();

  if (companyError || !company) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Company not found' }, { status: 404 }),
    };
  }

  // Verify user belongs to this company
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('id, company_id, role')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.company_id !== company.id) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Forbidden' }, { status: 403 }),
    };
  }

  // Check role if required
  if (allowedRoles && allowedRoles.length > 0) {
    if (!profile.role || !allowedRoles.includes(profile.role)) {
      return {
        ok: false,
        response: NextResponse.json(
          { error: `Forbidden: requires role ${allowedRoles.join(' or ')}` },
          { status: 403 }
        ),
      };
    }
  }

  return { ok: true, user, profile, company };
}

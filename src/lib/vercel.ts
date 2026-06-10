/**
 * Thin wrapper around the Vercel REST API for tenant custom-domain management.
 *
 * Each tenant's custom domain is added to a single Vercel project (the same one
 * that serves the platform). Vercel auto-provisions SSL once the domain is
 * verified and its DNS points at us. Per-tenant *subdomains* (tenant.soursync.com)
 * are covered by the wildcard `*.soursync.com` domain added to the project once,
 * so they never hit this API.
 *
 * Env:
 *   VERCEL_API_TOKEN  - access token with scope over the project's team
 *   VERCEL_PROJECT_ID - the project id (or name) the domains attach to
 *   VERCEL_TEAM_ID    - team/scope id (optional for personal accounts)
 */

const VERCEL_API = 'https://api.vercel.com';

// DNS targets a tenant must configure at their registrar.
export const VERCEL_APEX_A_RECORD = '76.76.21.21';
export const VERCEL_CNAME_TARGET = 'cname.vercel-dns.com';

export interface VercelConfig {
  token: string;
  projectId: string;
  teamId?: string;
}

export function getVercelConfig(): VercelConfig | null {
  const token = process.env.VERCEL_API_TOKEN;
  const projectId = process.env.VERCEL_PROJECT_ID;
  const teamId = process.env.VERCEL_TEAM_ID;
  if (!token || !projectId) return null;
  return { token, projectId, teamId };
}

/** Append the team scope to a Vercel API path when configured. */
function withTeam(path: string, cfg: VercelConfig): string {
  if (!cfg.teamId) return path;
  return path + (path.includes('?') ? '&' : '?') + `teamId=${cfg.teamId}`;
}

async function vercelFetch(
  path: string,
  cfg: VercelConfig,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${VERCEL_API}${withTeam(path, cfg)}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

/** Add a domain to the project. Treats "already exists" (409) as success. */
export async function addDomain(domain: string, cfg: VercelConfig) {
  const r = await vercelFetch(`/v10/projects/${cfg.projectId}/domains`, cfg, {
    method: 'POST',
    body: JSON.stringify({ name: domain }),
  });
  // 409 = domain_already_in_use / already added to this project — idempotent.
  if (!r.ok && r.status === 409) return { ok: true, status: 200, data: r.data };
  return r;
}

/** Project-scoped domain record: ownership/verification state. */
export async function getProjectDomain(domain: string, cfg: VercelConfig) {
  return vercelFetch(`/v9/projects/${cfg.projectId}/domains/${domain}`, cfg);
}

/** Global domain config: whether the live DNS points at Vercel correctly. */
export async function getDomainConfig(domain: string, cfg: VercelConfig) {
  return vercelFetch(`/v6/domains/${domain}/config`, cfg);
}

/** Ask Vercel to re-check ownership verification challenges. */
export async function verifyDomain(domain: string, cfg: VercelConfig) {
  return vercelFetch(
    `/v9/projects/${cfg.projectId}/domains/${domain}/verify`,
    cfg,
    { method: 'POST' }
  );
}

/** Remove a domain from the project. Treats 404 (not attached) as success. */
export async function removeDomain(domain: string, cfg: VercelConfig) {
  const r = await vercelFetch(
    `/v9/projects/${cfg.projectId}/domains/${domain}`,
    cfg,
    { method: 'DELETE' }
  );
  if (!r.ok && r.status === 404) return { ok: true, status: 200, data: r.data };
  return r;
}

/** DNS records to display to the tenant for the given apex domain. */
export function buildDnsRecords(_domain: string) {
  return [
    { type: 'A', host: '@', value: VERCEL_APEX_A_RECORD },
    { type: 'CNAME', host: 'www', value: VERCEL_CNAME_TARGET },
  ];
}

/**
 * Derive UI status from Vercel's two signals:
 *  - verified:      ownership confirmed (TXT/CNAME challenge satisfied)
 *  - misconfigured: live A/CNAME does NOT yet point at Vercel
 *
 * On Vercel, SSL is issued automatically once a domain is verified and not
 * misconfigured, so ssl tracks the same condition as a fully-live domain.
 */
export function deriveStatus(opts: { verified: boolean; misconfigured: boolean }) {
  const dnsActive = !opts.misconfigured;
  const sslActive = opts.verified && !opts.misconfigured;
  return {
    dns_status: dnsActive ? 'active' : 'pending',
    ssl_status: sslActive ? 'active' : 'pending',
    dnsActive,
    sslActive,
  };
}

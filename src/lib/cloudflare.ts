/**
 * Cloudflare for SaaS — Custom Hostnames API wrapper for tenant custom domains.
 *
 * Architecture (multi-tenant):
 *   - The app runs on the origin (origin.soursync.com -> VPS), fronted by the
 *     Cloudflare zone soursync.com.
 *   - Per-tenant SUBDOMAINS (tenant.soursync.com) are served by the proxied
 *     wildcard `*.soursync.com` DNS record + middleware rewrite. No API needed.
 *   - Per-tenant CUSTOM DOMAINS (tenant brings mycompany.com) are registered as
 *     Cloudflare "custom hostnames". The tenant points a CNAME at
 *     customers.soursync.com (CF_CNAME_TARGET); Cloudflare issues a per-hostname
 *     DV certificate and proxies traffic to the fallback origin.
 *
 * Free tier: first 100 custom hostnames are free.
 *
 * Env:
 *   CLOUDFLARE_API_TOKEN              - token scoped to the zone (SSL+Hostnames edit)
 *   CLOUDFLARE_ZONE_ID                - the soursync.com zone id
 *   NEXT_PUBLIC_DASHBOARD_CNAME_TARGET- hostname tenants CNAME to (customers.soursync.com)
 */

const CF_API = 'https://api.cloudflare.com/client/v4';

export interface CloudflareConfig {
  token: string;
  zoneId: string;
  cnameTarget: string;
}

export function getCloudflareConfig(): CloudflareConfig | null {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  const zoneId = process.env.CLOUDFLARE_ZONE_ID;
  const cnameTarget = process.env.NEXT_PUBLIC_DASHBOARD_CNAME_TARGET;
  if (!token || !zoneId || !cnameTarget) return null;
  return { token, zoneId, cnameTarget };
}

async function cfFetch(
  path: string,
  cfg: CloudflareConfig,
  init?: RequestInit
): Promise<{ ok: boolean; status: number; data: any }> {
  const res = await fetch(`${CF_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${cfg.token}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  // Cloudflare wraps real errors in { success:false, errors:[...] } even on 200,
  // so treat success on the body as authoritative.
  const ok = res.ok && data?.success !== false;
  return { ok, status: res.status, data };
}

/**
 * Create a custom hostname for a tenant domain. SSL is DV, validated over the
 * proxied CNAME (txt method works without HTTP reachability during cutover).
 */
export async function createCustomHostname(hostname: string, cfg: CloudflareConfig) {
  return cfFetch(`/zones/${cfg.zoneId}/custom_hostnames`, cfg, {
    method: 'POST',
    body: JSON.stringify({
      hostname,
      ssl: {
        method: 'txt',
        type: 'dv',
        settings: { min_tls_version: '1.2' },
      },
    }),
  });
}

/** Look up a custom hostname by its Cloudflare id. */
export async function getCustomHostname(id: string, cfg: CloudflareConfig) {
  return cfFetch(`/zones/${cfg.zoneId}/custom_hostnames/${id}`, cfg);
}

/** Find a custom hostname record by hostname (when we don't have the id). */
export async function findCustomHostname(hostname: string, cfg: CloudflareConfig) {
  const r = await cfFetch(
    `/zones/${cfg.zoneId}/custom_hostnames?hostname=${encodeURIComponent(hostname)}`,
    cfg
  );
  const match = (r.data?.result || []).find((h: any) => h.hostname === hostname) || null;
  return { ok: r.ok, status: r.status, record: match };
}

/** Delete a custom hostname by id. Treats 404 as success (already gone). */
export async function deleteCustomHostname(id: string, cfg: CloudflareConfig) {
  const r = await cfFetch(`/zones/${cfg.zoneId}/custom_hostnames/${id}`, cfg, {
    method: 'DELETE',
  });
  if (!r.ok && r.status === 404) return { ok: true, status: 200, data: r.data };
  return r;
}

/** Re-trigger DV certificate issuance for a hostname (PATCH re-validates). */
export async function reissueCustomHostnameSsl(id: string, cfg: CloudflareConfig) {
  return cfFetch(`/zones/${cfg.zoneId}/custom_hostnames/${id}`, cfg, {
    method: 'PATCH',
    body: JSON.stringify({
      ssl: { method: 'txt', type: 'dv', settings: { min_tls_version: '1.2' } },
    }),
  });
}

/**
 * Map a Cloudflare custom-hostname record to the app's dns/ssl status model.
 *   - hostname.status: pending | active | ... (ownership/routing)
 *   - hostname.ssl.status: pending_validation | active | ...
 */
export function deriveStatus(record: any) {
  const hostnameActive = record?.status === 'active';
  const sslActive = record?.ssl?.status === 'active';
  return {
    dns_status: hostnameActive ? 'active' : 'pending',
    ssl_status: sslActive ? 'active' : 'pending',
    dnsActive: hostnameActive,
    sslActive,
  };
}

/**
 * DNS instructions shown to the tenant. With Cloudflare for SaaS the tenant only
 * needs a single CNAME at their apex/host pointing to our CNAME target, plus the
 * SSL/ownership validation TXT records Cloudflare returns (extracted separately).
 */
export function buildDnsRecords(_domain: string, cfg: CloudflareConfig) {
  return [
    { type: 'CNAME', host: '@', value: cfg.cnameTarget },
    { type: 'CNAME', host: 'www', value: cfg.cnameTarget },
  ];
}

/**
 * Extract DV/ownership validation records (TXT) from a custom hostname record,
 * formatted for the UI's DnsRecord shape so they can be shown alongside the CNAME.
 */
export function extractValidationRecords(record: any) {
  const out: { type: string; host: string; value: string }[] = [];
  const ssl = record?.ssl || {};
  const sslRecords = ssl.validation_records || [];
  for (const v of sslRecords) {
    if (v.txt_name && v.txt_value) {
      out.push({ type: 'TXT', host: v.txt_name, value: v.txt_value });
    }
  }
  const ov = record?.ownership_verification;
  if (ov?.type === 'txt' && ov.name && ov.value) {
    out.push({ type: 'TXT', host: ov.name, value: ov.value });
  }
  return out;
}

# Multi-tenant domains with Cloudflare for SaaS

This app serves many tenants from one origin, fronted by the **soursync.com**
Cloudflare zone:

- **Per-tenant subdomains** — `tenant.soursync.com` → the proxied wildcard
  `*.soursync.com` DNS record reaches the origin; middleware rewrites the request
  to `/site/<slug>`. No API call needed.
- **Per-tenant custom domains** — `mycompany.com` is registered as a Cloudflare
  **Custom Hostname** (Cloudflare for SaaS). The tenant points a CNAME at
  `customers.soursync.com`; Cloudflare issues a per-hostname SSL cert and proxies
  to the fallback origin. **Free for the first 100 custom hostnames.**

The app itself runs on the origin (`origin.soursync.com` → the VPS). Cloudflare is
the TLS + routing layer, so hosting is not tied to Vercel/Netlify.

## Code

- `src/lib/cloudflare.ts` — Custom Hostnames API wrapper + status/DNS mappers.
- `src/app/api/cloudflare/{register,check,remove,force-ssl}-domain` — self-serve
  custom-domain flow (replaces the old Netlify/Vercel routes).
- `src/app/store/[companySlug]/domain/page.tsx` — calls `/api/cloudflare/*`;
  shows the CNAME target + SSL/ownership TXT records returned by Cloudflare.
- `src/middleware.ts` — platform domains = `soursync.com` + `localhost`; infra
  subdomains (`origin`/`customers`/`fallback`) reserved so they aren't treated as
  tenant slugs.

> `website_settings_private` columns keep their `netlify_` prefix
> (`netlify_dns_records`, `netlify_domain_id`) to avoid a schema migration.
> `netlify_domain_id` now stores the Cloudflare custom-hostname id.

## Cloudflare account state (already configured)

Verified on the `soursync.com` zone:

- Zone active; nameservers delegated to Cloudflare. ✅
- DNS: `soursync.com`, `*.soursync.com`, `customers.soursync.com`, `fallback`
  proxied → origin `46.202.186.249`; `origin.soursync.com` DNS-only. ✅
- **Fallback origin set to `origin.soursync.com`.** ✅ (set via API during setup)
- Custom Hostnames API reachable; 0 hostnames registered so far.

## Required env (see .env.example)

- `CLOUDFLARE_API_TOKEN` — zone-scoped, with **SSL and Certificates: Edit** and
  **Custom Hostnames** permissions.
- `CLOUDFLARE_ZONE_ID` — `9c738749cd8fde7e2467e9ebacae1558`
- `CLOUDFLARE_CUSTOM_ORIGIN_SERVER` — `origin.soursync.com`
- `NEXT_PUBLIC_DASHBOARD_CNAME_TARGET` — `customers.soursync.com`

## Tenant flow (custom domain)

1. Tenant enters `mycompany.com` → `register-domain` creates a Cloudflare custom
   hostname (DV cert, TXT validation) and stores its id.
2. Tenant adds the shown records at their registrar:
   - `CNAME @  → customers.soursync.com` (and `www`). If their DNS can't CNAME the
     root, use CNAME flattening / ALIAS / ANAME.
   - the SSL/ownership `TXT` record(s) Cloudflare returned.
3. The page polls `check-domain` every 10s; once Cloudflare reports the hostname
   `active` and SSL `active`, DNS + SSL flip to active and the domain is live.

## Cost

- Cloudflare Free plan + Cloudflare for SaaS (100 custom hostnames free; then
  $0.10/hostname/mo). Commercial use is allowed.
- Origin hosting = the VPS (e.g. Hostinger). No Vercel/Netlify needed.

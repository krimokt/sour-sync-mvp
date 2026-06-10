# Migrating Domain Settings from Netlify to Vercel (multi-tenant)

This app serves many tenants from one deployment:

- **Per-tenant subdomains** — `tenant.soursync.com` → middleware rewrites to `/site/<slug>`.
- **Tenant custom domains** — bring-your-own domains added to the Vercel project
  via the Vercel Domains API (`/api/vercel/*`). SSL is automatic.

## What changed in code

- `src/lib/vercel.ts` — Vercel Domains API helper.
- `src/app/api/vercel/{register,check,remove,force-ssl}-domain` — replaces the
  old `/api/netlify/*` routes (deleted). Same request/response shapes.
- `src/middleware.ts` — platform domain `netlify.app` → `vercel.app`; custom-domain
  fallback URL now defaults to `https://soursync.com`.
- `src/app/store/[companySlug]/domain/page.tsx` — calls `/api/vercel/*`; DNS shown
  to tenants is now `A @ 76.76.21.21` and `CNAME www cname.vercel-dns.com`.
- `next.config.js` — security + cache headers moved here from `netlify.toml`
  (deleted). `@netlify/plugin-nextjs` removed from `package.json`.

> The `website_settings_private` columns keep their `netlify_` prefix
> (`netlify_dns_records`, `netlify_domain_id`) to avoid a DB migration. They now
> hold Vercel data. Rename later if desired.

## Plan & cost (Hobby vs Pro)

- **Tenant custom domains** and **automatic SSL** work on the free **Hobby** plan,
  so this can be tested/launched for free.
- **Caveat:** Hobby is for *non-commercial* use. A multi-tenant SaaS where tenants
  attach their own branded domains is commercial use and can be flagged/suspended.
  Upgrade to **Pro (~$20/mo)** before onboarding real/paying tenants.
- **Wildcard `*.soursync.com` (any plan):** Vercel can only auto-issue a wildcard
  SSL cert when it controls DNS, so the apex `soursync.com` must use **Vercel's
  nameservers** (set `ns1.vercel-dns.com` / `ns2.vercel-dns.com` at your registrar).
  Individual tenant custom domains do NOT need this — only the wildcard subdomain.

### Personal (non-team) account

If the project lives on a personal account (no team):

- `VERCEL_PROJECT_ID=prj_CXhL2u2v1k8WQTXFAwDQmx4GNRnA`
- `VERCEL_API_TOKEN=` personal token (Account → Settings → Tokens)
- `VERCEL_TEAM_ID=` **leave empty** — the helper omits the `teamId` param when unset.

## One-time manual setup in Vercel

1. **Import the repo** into a Vercel project (framework auto-detected as Next.js,
   package manager auto-detected as pnpm from `pnpm-lock.yaml`).
2. **Add environment variables** (Project → Settings → Environment Variables) —
   see `.env.example`. Required for domains: `VERCEL_API_TOKEN`,
   `VERCEL_PROJECT_ID`, and `VERCEL_TEAM_ID` (team accounts only). Plus all the
   Supabase / app vars.
3. **Create the API token**: Account Settings → Tokens. Scope it to the team
   that owns the project. Put it in `VERCEL_API_TOKEN`.
4. **Add the platform domains** to the project (Settings → Domains):
   - `soursync.com`
   - `www.soursync.com`
   - `*.soursync.com`  ← wildcard for tenant subdomains (Vercel issues a wildcard cert)
5. **Repoint `soursync.com` DNS** at your registrar:
   - `A  @    76.76.21.21`
   - `CNAME  www    cname.vercel-dns.com`
   - For the wildcard, add `CNAME  *  cname.vercel-dns.com`
     (the apex + wildcard can also be handled via Vercel nameservers).
6. Remove the old `NETLIFY_*` env vars; decommission the Netlify site once cut over.

## Tenant flow (custom domain)

1. Tenant enters `mycompany.com` in Domain Settings → `register-domain` adds
   `mycompany.com` + `www.mycompany.com` to the Vercel project.
2. Tenant sets the displayed DNS records at their registrar.
3. The page polls `check-domain` every 10s; once Vercel reports the domain
   verified and not misconfigured, DNS + SSL flip to active automatically.

## Quick verification after deploy

- `https://soursync.com` and `https://<any-tenant>.soursync.com` load.
- In Domain Settings, add a test domain and confirm the DNS records shown are the
  Vercel values, and status transitions to active after DNS propagates.

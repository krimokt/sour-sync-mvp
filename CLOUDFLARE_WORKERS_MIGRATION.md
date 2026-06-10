# Hosting migration: Hostinger shared → Cloudflare Workers (OpenNext)

## Why
`soursync.com` currently runs on Hostinger **Business (shared) hosting**. Shared
hosting only completes TLS / serves the app for hostnames that have a registered
vhost, so `*.soursync.com` and tenant custom domains fail with **HTTP 525**.
Running the Next.js app on **Cloudflare Workers** (via the OpenNext adapter) makes
Cloudflare serve every hostname at the edge — apex, wildcard subdomains, and
Cloudflare-for-SaaS custom hostnames — with no origin and no 525.

The existing `/api/cloudflare/*` custom-hostname code stays valid: the Worker
simply becomes the destination for custom hostnames.

## Target architecture
- App = a single Cloudflare Worker (OpenNext build output).
- `soursync.com` + `*.soursync.com` → Worker (Workers Custom Domains / routes).
- Tenant custom domains → Cloudflare for SaaS custom hostnames routed to the Worker.
- Supabase, Upstash, Gemini reached over fetch (Workers-compatible).

## Steps

### 1. Dependencies
```
pnpm add @opennextjs/cloudflare@latest
pnpm add -D wrangler@latest
```
(Stop any `next dev` first — on Windows it locks `@next/swc-*` and breaks install.)

### 2. wrangler.jsonc
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "soursync",
  "main": ".open-next/worker.js",
  "compatibility_date": "2025-03-01",
  "compatibility_flags": ["nodejs_compat"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "observability": { "enabled": true }
}
```

### 3. open-next.config.ts
```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
export default defineCloudflareConfig();
```

### 4. next.config.js (dev hook, optional)
```js
// at top
const { initOpenNextCloudflareForDev } = require("@opennextjs/cloudflare");
initOpenNextCloudflareForDev();
```

### 5. package.json scripts
```jsonc
"preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
"deploy":  "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
"cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
```

### 6. Secrets / env
Set every server var as a Worker secret (or in the dashboard):
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
`SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`,
`NEXT_PUBLIC_DASHBOARD_CNAME_TARGET`, `JWT_SECRET`, `NEXT_PUBLIC_GEMINI_API_KEY`,
`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, plus `NEXT_PUBLIC_SITE_URL`.
`NEXT_PUBLIC_*` must also be present at build time. Local dev: `.dev.vars`.

### 7. Build, preview, deploy
```
wrangler login
pnpm preview        # local Workers runtime smoke test
pnpm deploy         # publish the Worker
```
Then in the dashboard: attach `soursync.com` + `*.soursync.com` to the Worker
(Workers → soursync → Domains & Routes), and keep the `/api/cloudflare/*` flow
for tenant custom hostnames.

## Verified so far (build only)
- ✅ `opennextjs-cloudflare build` completes; `.open-next/worker.js` produced.
- ✅ **Bundle size: 14.9 MB raw / 2.72 MB gzipped** (`wrangler deploy --dry-run`).
  Fits the **free Workers 3 MB limit — but only ~0.28 MB headroom**. Growth will
  likely require **Workers Paid ($5/mo, 10 MB)**.
- ⚠️ Next.js is 14.2.35, outside Next's official support window, so the build
  needs `--dangerouslyUseUnsupportedNextVersion` (baked into the npm scripts).
  Recommended: plan a Next 15 upgrade to drop the flag.
- ⚠️ OpenNext warns it's **not fully reliable on native Windows** — run the real
  build/deploy from **WSL** or Linux CI (e.g. GitHub Actions), not plain Windows.
- ⏳ Not yet verified at runtime (needs `pnpm preview` / deploy): next/image,
  Supabase service-role routes, middleware sessions.

## Risks to validate during the first real build/deploy
1. **Worker size limit.** Free Workers cap the script at ~3 MB gzipped; a Next app
   can exceed it. If so, the **Workers Paid plan ($5/mo)** raises it to 10 MB.
   This is the most likely "free" caveat.
2. **next/image optimization.** The default optimizer isn't available on Workers.
   Either use a Cloudflare Images loader or set `images.unoptimized = true`
   (remotePatterns already configured). Validate `/site/*` image rendering.
3. **Supabase service-role route handlers** (`@supabase/supabase-js`) — fetch-based,
   should run under `nodejs_compat`; confirm no Node-only APIs leak in.
4. **Middleware** (`@supabase/auth-helpers-nextjs`) — runs in the Worker; verify
   cookie/session handling and the subdomain/custom-domain rewrites.
5. **Cold path / CPU limits** on free plan for SSR routes.

## Rollback
Until DNS/routes are switched to the Worker, Hostinger keeps serving the app, so
this migration is additive and reversible up to the cutover.
```

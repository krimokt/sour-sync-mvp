# Valom Template Integration — Plan & Timeline

Integrate the **Valom – Business Consultancy** template (Next.js 14 App Router,
React 18, TypeScript, **Bootstrap 5**, GSAP/AOS/Swiper) into the existing
SourSync MVP (Next.js + React + TypeScript + **Tailwind v4** + Supabase).

> Estimates are **build sessions** (~½ focused day each, incl. typecheck/lint).
> They exclude buying/licensing, your review/QA, and content entry.
> Calendar assumes one person working in focused blocks.

---

## The big fork: Bootstrap vs Tailwind

The template ships **Bootstrap 5**; the app uses **Tailwind**. This one choice
drives most of the timeline.

| Path | What it means | Effort | Risk |
|---|---|---|---|
| **A. Keep Bootstrap (scoped)** | Load Bootstrap only on template-based pages; two CSS systems coexist. Fastest path; visuals match the template exactly. | Lower | CSS bleed between systems; larger bundle; theme tokens not shared |
| **B. Convert to Tailwind** | Port the template markup to Tailwind to match the storefront design system. Cleaner, one system, on-brand. | Higher (≈ +1 session per page) | More upfront work; risk of drifting from template look |

**Recommendation:** **Path A for speed** (get it live), then convert high-value
pages to Tailwind later if you want one system. Plan below shows both.

---

## Phase 0 — Intake & decision *(~0.5 session)*
- Receive the template source; read its structure, `package.json`, routing, and
  which pages/components you actually want.
- Confirm: which Valom pages to use, Bootstrap-vs-Tailwind (A/B), and whether
  pages are **marketing-static** or need **Supabase data wiring**.
- Dependency check: Bootstrap 5, GSAP, AOS, Swiper, react-modal-video vs current
  deps (avoid version clashes with Tailwind v4 / React 18).

## Phase 1 — Scaffold & dependencies *(~0.5–1 session)*
- Install template deps; wire global CSS/JS (Bootstrap + AOS/GSAP init) **scoped**
  so it doesn't leak into existing Tailwind pages.
- Set up the template's fonts/assets; copy `public` assets.
- Get one Valom page rendering inside the app behind a route.

## Phase 2 — Bring pages in *(per-page; this is the bulk)*
Per page, **static** (Path A): ~0.5 session. **converted to Tailwind** (Path B):
~1–1.5 sessions.

Typical consultancy template page set (estimate for ~6 pages):
| Pages | Path A (keep Bootstrap) | Path B (convert) |
|---|---|---|
| Home, About, Services, Service-detail, Contact, Blog | ~3 sessions | ~7–9 sessions |

## Phase 3 — Wire to your data *(~2–4 sessions, only for dynamic pages)*
Only if template pages must show real data instead of demo content:
- Services/blog/case studies → Supabase (you already have `blog_posts`,
  `case_studies`, `testimonials`).
- Contact form → existing `/api/site/[slug]/contact`.
- Multi-tenant: make it themeable per tenant + slug-aware (if it's a storefront
  surface, not just marketing).
- Skip this phase for purely static marketing pages.

## Phase 4 — Fit & finish *(~1–2 sessions)*
- Responsive pass, dark-mode (if needed), accessibility (focus, alt, contrast),
  remove unused template cruft, reconcile any CSS conflicts.
- SEO: metadata/sitemap/JSON-LD consistent with the work already done.
- Typecheck + lint clean, smoke-test all routes.

---

## Rolled-up estimates

| Scenario | Build sessions | ≈ Calendar |
|---|---|---|
| **A — Keep Bootstrap, mostly static** (6 pages, light data) | **~6–8** | ~1–1.5 weeks |
| **B — Convert to Tailwind, mostly static** (6 pages) | **~10–13** | ~2–2.5 weeks |
| **A + full data wiring** (multi-tenant, Supabase) | **~10–14** | ~2–3 weeks |
| **B + full data wiring** | **~15–20** | ~3–4 weeks |

**Fastest realistic "looks live" demo:** Phase 0–2 on Path A → **~4–5 sessions
(~1 week)** with template demo content, data wiring deferred.

---

## What changes the estimate
- **# of pages** you actually use (each page is the main unit of work).
- **Static vs data-driven** (data wiring is where time goes).
- **Bootstrap kept vs converted** (Path B roughly doubles per-page time).
- **Multi-tenant theming** (per-tenant colors/content) adds work if it's a
  storefront surface rather than a one-off marketing site.
- **Code quality of the template** (clean/commented as advertised = faster;
  messy = slower) — only knowable once I read the source.

## Assumptions / unknowns (refined once I see the source)
- Template is genuinely Next 14 App Router (not Pages Router) — affects routing fit.
- No hard dependency conflicts with React 18 / Tailwind v4 already installed.
- Licensing permits modification (ThemeForest Regular/Extended as appropriate).

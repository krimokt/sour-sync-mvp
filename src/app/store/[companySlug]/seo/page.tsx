'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { toast } from 'sonner';
import { Check, X, Search, ChevronDown, Save, Globe } from 'lucide-react';

interface HomeSeo {
  meta_title: string;
  meta_description: string;
  og_image: string;
}

interface ProductSeoRow {
  id: string;
  name: string;
  description: string | null;
  images: string[] | null;
  category: string | null;
  sku: string | null;
  slug: string | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  og_image: string | null;
}

/** A single scorecard check. */
interface Check {
  label: string;
  pass: boolean;
  hint?: string;
}

const TITLE_MIN = 50;
const TITLE_MAX = 60;
const DESC_MIN = 120;
const DESC_MAX = 160;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Pure scorecard for a product's SEO state. */
function scoreProduct(p: ProductSeoRow): Check[] {
  const title = (p.meta_title || p.name || '').trim();
  const desc = (p.meta_description || p.description || '').trim();
  const kw = (p.focus_keyword || '').trim().toLowerCase();
  const imgs = p.images?.length ?? 0;
  const has = (hay: string) => kw.length > 0 && hay.toLowerCase().includes(kw);

  return [
    {
      label: `Title ${title.length} chars (aim ${TITLE_MIN}–${TITLE_MAX})`,
      pass: title.length >= TITLE_MIN && title.length <= TITLE_MAX,
      hint: 'Set a meta title between 50 and 60 characters.',
    },
    {
      label: `Description ${desc.length} chars (aim ${DESC_MIN}–${DESC_MAX})`,
      pass: desc.length >= DESC_MIN && desc.length <= DESC_MAX,
      hint: 'Write a 120–160 character description.',
    },
    { label: 'Focus keyword set', pass: kw.length > 0, hint: 'Add the phrase buyers actually search.' },
    { label: 'Keyword in title', pass: has(title), hint: 'Include the focus keyword in the title.' },
    { label: 'Keyword in description', pass: has(desc), hint: 'Mention the keyword in the description.' },
    { label: 'Keyword in product name', pass: has(p.name || ''), hint: 'A descriptive product name helps.' },
    { label: 'URL slug set', pass: !!p.slug && p.slug.length > 0 && p.slug.length <= 60, hint: 'Add a short, keyword-rich slug.' },
    { label: '3+ product images', pass: imgs >= 3, hint: 'Upload at least 3 original photos.' },
  ];
}

function ScoreBadge({ checks }: { checks: Check[] }) {
  const passed = checks.filter((c) => c.pass).length;
  const pct = Math.round((passed / checks.length) * 100);
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: `${color}15`, color }}
    >
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      {passed}/{checks.length} · {pct}%
    </span>
  );
}

function CheckList({ checks }: { checks: Check[] }) {
  return (
    <ul className="space-y-1.5">
      {checks.map((c) => (
        <li key={c.label} className="flex items-start gap-2 text-sm">
          {c.pass ? (
            <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          )}
          <span className={c.pass ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}>
            {c.label}
            {!c.pass && c.hint && <span className="block text-xs text-gray-400">{c.hint}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40';

function CharCount({ value, min, max }: { value: string; min: number; max: number }) {
  const n = value.length;
  const ok = n >= min && n <= max;
  return (
    <span className={`text-xs ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      {n} / {max}
    </span>
  );
}

export default function SeoPage() {
  const { company } = useStore();
  const companyId = (company as { id?: string } | null)?.id;

  const [loading, setLoading] = useState(true);
  const [savingHome, setSavingHome] = useState(false);
  const [home, setHome] = useState<HomeSeo>({ meta_title: '', meta_description: '', og_image: '' });
  const [products, setProducts] = useState<ProductSeoRow[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    if (!companyId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [{ data: ws }, { data: prods }] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('website_settings') as any)
          .select('meta_title, meta_description, og_image')
          .eq('company_id', companyId)
          .single(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (supabase.from('products') as any)
          .select('id, name, description, images, category, sku, slug, meta_title, meta_description, focus_keyword, og_image')
          .eq('company_id', companyId)
          .order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      if (ws) {
        setHome({
          meta_title: ws.meta_title ?? '',
          meta_description: ws.meta_description ?? '',
          og_image: ws.og_image ?? '',
        });
      }
      setProducts((prods ?? []) as ProductSeoRow[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const saveHome = async () => {
    if (!companyId) return;
    setSavingHome(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('website_settings') as any)
      .update({
        meta_title: home.meta_title || null,
        meta_description: home.meta_description || null,
        og_image: home.og_image || null,
      })
      .eq('company_id', companyId);
    setSavingHome(false);
    if (error) {
      toast.error('Could not save homepage SEO');
      return;
    }
    toast.success('Homepage SEO saved');
  };

  const updateProductField = (id: string, field: keyof ProductSeoRow, value: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const saveProduct = async (p: ProductSeoRow) => {
    setSavingId(p.id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('products') as any)
      .update({
        slug: p.slug ? slugify(p.slug) : null,
        meta_title: p.meta_title || null,
        meta_description: p.meta_description || null,
        focus_keyword: p.focus_keyword || null,
        og_image: p.og_image || null,
      })
      .eq('id', p.id);
    setSavingId(null);
    if (error) {
      toast.error(error.message?.includes('duplicate') ? 'That slug is already used by another product' : 'Could not save product SEO');
      return;
    }
    toast.success('Product SEO saved');
  };

  const homeChecks = useMemo<Check[]>(() => {
    const t = home.meta_title.trim();
    const d = home.meta_description.trim();
    return [
      { label: `Title ${t.length} chars (aim ${TITLE_MIN}–${TITLE_MAX})`, pass: t.length >= TITLE_MIN && t.length <= TITLE_MAX },
      { label: `Description ${d.length} chars (aim ${DESC_MIN}–${DESC_MAX})`, pass: d.length >= DESC_MIN && d.length <= DESC_MAX },
      { label: 'Social share image set', pass: home.og_image.trim().length > 0 },
    ];
  }, [home]);

  if (!companyId) {
    return <div className="p-6 text-gray-500">Loading company…</div>;
  }

  return (
    <div>
      <PageBreadcrumb pageTitle="SEO" />

      <p className="mb-6 max-w-3xl text-sm text-gray-500 dark:text-gray-400">
        Control how your storefront appears in Google and on social media. Leave a field blank to use the
        smart default we generate from your content. Aim for green on the scorecards.
      </p>

      {/* Homepage SEO */}
      <section className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-cyan-600" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Homepage</h2>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta title</label>
                <CharCount value={home.meta_title} min={TITLE_MIN} max={TITLE_MAX} />
              </div>
              <input
                className={inputCls}
                value={home.meta_title}
                onChange={(e) => setHome((h) => ({ ...h, meta_title: e.target.value }))}
                placeholder="e.g. WhiteSourcing — Water Pump Sourcing in Morocco"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta description</label>
                <CharCount value={home.meta_description} min={DESC_MIN} max={DESC_MAX} />
              </div>
              <textarea
                className={`${inputCls} min-h-[88px] resize-y`}
                value={home.meta_description}
                onChange={(e) => setHome((h) => ({ ...h, meta_description: e.target.value }))}
                placeholder="One or two sentences describing what you sell and where."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Social share image URL (OpenGraph)
              </label>
              <input
                className={inputCls}
                value={home.og_image}
                onChange={(e) => setHome((h) => ({ ...h, og_image: e.target.value }))}
                placeholder="https://…/your-banner-1200x630.jpg"
              />
            </div>
            <button
              onClick={saveHome}
              disabled={savingHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {savingHome ? 'Saving…' : 'Save homepage SEO'}
            </button>
          </div>

          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Scorecard</span>
              <ScoreBadge checks={homeChecks} />
            </div>
            <CheckList checks={homeChecks} />
          </div>
        </div>
      </section>

      {/* Products SEO */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-5 h-5 text-cyan-600" />
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Products <span className="text-gray-400 font-normal">({products.length})</span>
          </h2>
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="text-gray-500 text-sm">No products yet. Publish products to optimise them here.</div>
        ) : (
          <div className="space-y-3">
            {products.map((p) => {
              const checks = scoreProduct(p);
              const open = openId === p.id;
              return (
                <div key={p.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                  <button
                    onClick={() => setOpenId(open ? null : p.id)}
                    className="w-full flex items-center gap-3 p-4 text-left"
                  >
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                    <span className="flex-1 min-w-0 truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                      {p.name}
                    </span>
                    <ScoreBadge checks={checks} />
                  </button>

                  {open && (
                    <div className="border-t border-gray-100 dark:border-gray-800 p-4 md:p-5 grid gap-5 lg:grid-cols-[1fr_280px]">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta title</label>
                            <CharCount value={p.meta_title ?? ''} min={TITLE_MIN} max={TITLE_MAX} />
                          </div>
                          <input
                            className={inputCls}
                            value={p.meta_title ?? ''}
                            onChange={(e) => updateProductField(p.id, 'meta_title', e.target.value)}
                            placeholder={`${p.name} — Buy from your store`}
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Meta description</label>
                            <CharCount value={p.meta_description ?? ''} min={DESC_MIN} max={DESC_MAX} />
                          </div>
                          <textarea
                            className={`${inputCls} min-h-[80px] resize-y`}
                            value={p.meta_description ?? ''}
                            onChange={(e) => updateProductField(p.id, 'meta_description', e.target.value)}
                            placeholder="Specs, use cases, materials, MOQ, lead time…"
                          />
                        </div>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Focus keyword</label>
                            <input
                              className={inputCls}
                              value={p.focus_keyword ?? ''}
                              onChange={(e) => updateProductField(p.id, 'focus_keyword', e.target.value)}
                              placeholder="e.g. solar submersible water pump"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL slug</label>
                            <input
                              className={inputCls}
                              value={p.slug ?? ''}
                              onChange={(e) => updateProductField(p.id, 'slug', e.target.value)}
                              onBlur={(e) => updateProductField(p.id, 'slug', slugify(e.target.value))}
                              placeholder="solar-submersible-water-pump-24v"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Social share image URL (OpenGraph)
                          </label>
                          <input
                            className={inputCls}
                            value={p.og_image ?? ''}
                            onChange={(e) => updateProductField(p.id, 'og_image', e.target.value)}
                            placeholder="Defaults to the first product image"
                          />
                        </div>
                        <button
                          onClick={() => saveProduct(p)}
                          disabled={savingId === p.id}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium disabled:opacity-50"
                        >
                          <Save className="w-4 h-4" />
                          {savingId === p.id ? 'Saving…' : 'Save product SEO'}
                        </button>
                      </div>

                      <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 self-start">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Scorecard</span>
                          <ScoreBadge checks={checks} />
                        </div>
                        <CheckList checks={checks} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

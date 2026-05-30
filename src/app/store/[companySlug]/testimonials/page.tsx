'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { toast } from 'sonner';
import { Plus, Save, Trash2, ArrowLeft, Eye, EyeOff, MessageSquareQuote, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  company_id: string;
  quote: string;
  author_name: string;
  author_title: string | null;
  author_company: string | null;
  avatar_image: string | null;
  rating: number | null;
  sort_order: number;
  status: string;
  updated_at: string | null;
}

const emptyDraft = (companyId: string): Testimonial => ({
  id: '',
  company_id: companyId,
  quote: '',
  author_name: '',
  author_title: '',
  author_company: '',
  avatar_image: '',
  rating: 5,
  sort_order: 0,
  status: 'draft',
  updated_at: null,
});

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40';

export default function TestimonialsAdminPage() {
  const { company } = useStore();
  const companyId = (company as { id?: string; slug?: string } | null)?.id;
  const companySlug = (company as { slug?: string } | null)?.slug;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Testimonial[]>([]);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('testimonials') as any)
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false });
    setItems((data ?? []) as Testimonial[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const set = (field: keyof Testimonial, value: string | number) =>
    setEditing((p) => (p ? { ...p, [field]: value } : p));

  const startNew = () => {
    if (!companyId) return;
    setEditing(emptyDraft(companyId));
  };

  const save = async (publish?: boolean) => {
    if (!editing || !companyId) return;
    if (!editing.quote.trim()) {
      toast.error('Quote is required');
      return;
    }
    if (!editing.author_name.trim()) {
      toast.error('Author name is required');
      return;
    }
    const status = publish === undefined ? editing.status : publish ? 'published' : 'draft';
    const ratingNum = Number(editing.rating);
    const payload = {
      company_id: companyId,
      quote: editing.quote.trim(),
      author_name: editing.author_name.trim(),
      author_title: editing.author_title || null,
      author_company: editing.author_company || null,
      avatar_image: editing.avatar_image || null,
      rating: Number.isFinite(ratingNum) && ratingNum > 0 ? Math.min(5, Math.max(1, ratingNum)) : null,
      sort_order: Number(editing.sort_order) || 0,
      status,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('testimonials') as any;
    const { error } = editing.id
      ? await table.update(payload).eq('id', editing.id)
      : await table.insert(payload);
    setSaving(false);

    if (error) {
      toast.error('Could not save testimonial');
      return;
    }
    toast.success(status === 'published' ? 'Testimonial published' : 'Draft saved');
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this testimonial? This cannot be undone.')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('testimonials') as any).delete().eq('id', id);
    if (error) {
      toast.error('Could not delete testimonial');
      return;
    }
    toast.success('Testimonial deleted');
    load();
  };

  const togglePublish = async (tm: Testimonial) => {
    const next = tm.status === 'published' ? 'draft' : 'published';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('testimonials') as any)
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', tm.id);
    if (error) {
      toast.error('Could not update status');
      return;
    }
    toast.success(next === 'published' ? 'Published' : 'Unpublished');
    load();
  };

  if (!companyId) return <div className="p-6 text-gray-500">Loading company…</div>;

  // ---- Editor view ----
  if (editing) {
    return (
      <div>
        <PageBreadcrumb pageTitle="Testimonials" />
        <button
          onClick={() => setEditing(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all testimonials
        </button>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quote</label>
              <textarea
                className={`${inputCls} min-h-[120px] resize-y`}
                value={editing.quote}
                onChange={(e) => set('quote', e.target.value)}
                placeholder="They handled sourcing, QC and freight end to end. Goods arrived on spec and on time."
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Author name</label>
                <input className={inputCls} value={editing.author_name} onChange={(e) => set('author_name', e.target.value)} placeholder="Sarah Mensah" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title / role</label>
                <input className={inputCls} value={editing.author_title ?? ''} onChange={(e) => set('author_title', e.target.value)} placeholder="Head of Procurement" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company</label>
                <input className={inputCls} value={editing.author_company ?? ''} onChange={(e) => set('author_company', e.target.value)} placeholder="AgriCorp Ltd." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Avatar image URL</label>
                <input className={inputCls} value={editing.avatar_image ?? ''} onChange={(e) => set('avatar_image', e.target.value)} placeholder="https://… (optional)" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Publish</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Status: <span className="font-semibold">{editing.status}</span>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => save(true)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium disabled:opacity-50"
                >
                  <Eye className="w-4 h-4" /> {saving ? 'Saving…' : 'Publish'}
                </button>
                <button
                  onClick={() => save(false)}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" /> Save draft
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Details</div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Rating (1–5, optional)</label>
                <input type="number" min={0} max={5} className={inputCls} value={editing.rating ?? ''} onChange={(e) => set('rating', e.target.value)} placeholder="5" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sort order</label>
                <input type="number" className={inputCls} value={editing.sort_order} onChange={(e) => set('sort_order', e.target.value)} placeholder="0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---- List view ----
  return (
    <div>
      <PageBreadcrumb pageTitle="Testimonials" />
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Collect short quotes from buyers you&rsquo;ve served. Published testimonials show in the &ldquo;What buyers
          say&rdquo; section of your homepage, right before the contact form.
        </p>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New testimonial
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading testimonials…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <MessageSquareQuote className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No testimonials yet. Add a buyer quote to build trust.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((tm) => (
            <div
              key={tm.id}
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <button onClick={() => setEditing(tm)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{tm.author_name}</span>
                  {typeof tm.rating === 'number' && tm.rating > 0 && (
                    <span className="inline-flex items-center gap-0.5 text-amber-500">
                      <Star className="w-3 h-3 fill-current" /> <span className="text-xs">{tm.rating}</span>
                    </span>
                  )}
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      tm.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {tm.status}
                  </span>
                </div>
                <span className="block truncate text-xs text-gray-400">
                  &ldquo;{tm.quote}&rdquo;
                </span>
              </button>
              {tm.status === 'published' && companySlug && (
                <a
                  href={`/site/${companySlug}#testimonials`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-600 hover:underline flex-shrink-0"
                >
                  View
                </a>
              )}
              <button
                onClick={() => togglePublish(tm)}
                title={tm.status === 'published' ? 'Unpublish' : 'Publish'}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {tm.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => remove(tm.id)}
                title="Delete"
                className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

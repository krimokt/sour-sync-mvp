'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { toast } from 'sonner';
import { Plus, Save, Trash2, ArrowLeft, Eye, EyeOff, Building2 } from 'lucide-react';

interface CaseStudy {
  id: string;
  company_id: string;
  slug: string;
  title: string;
  client_name: string | null;
  summary: string | null;
  scope: string | null;
  location: string | null;
  year: string | null;
  cover_image: string | null;
  metric_label: string | null;
  metric_value: string | null;
  sort_order: number;
  status: string;
  updated_at: string | null;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const emptyDraft = (companyId: string): CaseStudy => ({
  id: '',
  company_id: companyId,
  slug: '',
  title: '',
  client_name: '',
  summary: '',
  scope: '',
  location: '',
  year: '',
  cover_image: '',
  metric_label: '',
  metric_value: '',
  sort_order: 0,
  status: 'draft',
  updated_at: null,
});

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40';

export default function CaseStudiesAdminPage() {
  const { company } = useStore();
  const companyId = (company as { id?: string; slug?: string } | null)?.id;
  const companySlug = (company as { slug?: string } | null)?.slug;

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CaseStudy[]>([]);
  const [editing, setEditing] = useState<CaseStudy | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('case_studies') as any)
      .select('*')
      .eq('company_id', companyId)
      .order('sort_order', { ascending: true })
      .order('updated_at', { ascending: false });
    setItems((data ?? []) as CaseStudy[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const set = (field: keyof CaseStudy, value: string | number) =>
    setEditing((p) => (p ? { ...p, [field]: value } : p));

  const startNew = () => {
    if (!companyId) return;
    setSlugTouched(false);
    setEditing(emptyDraft(companyId));
  };

  const save = async (publish?: boolean) => {
    if (!editing || !companyId) return;
    if (!editing.title.trim()) {
      toast.error('Title is required');
      return;
    }
    const slug = slugify(editing.slug || editing.title);
    const status = publish === undefined ? editing.status : publish ? 'published' : 'draft';
    const payload = {
      company_id: companyId,
      slug,
      title: editing.title.trim(),
      client_name: editing.client_name || null,
      summary: editing.summary || null,
      scope: editing.scope || null,
      location: editing.location || null,
      year: editing.year || null,
      cover_image: editing.cover_image || null,
      metric_label: editing.metric_label || null,
      metric_value: editing.metric_value || null,
      sort_order: Number(editing.sort_order) || 0,
      status,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('case_studies') as any;
    const { error } = editing.id
      ? await table.update(payload).eq('id', editing.id)
      : await table.insert(payload);
    setSaving(false);

    if (error) {
      toast.error(error.message?.includes('duplicate') ? 'That slug is already used' : 'Could not save project');
      return;
    }
    toast.success(status === 'published' ? 'Project published' : 'Draft saved');
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this project? This cannot be undone.')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('case_studies') as any).delete().eq('id', id);
    if (error) {
      toast.error('Could not delete project');
      return;
    }
    toast.success('Project deleted');
    load();
  };

  const togglePublish = async (cs: CaseStudy) => {
    const next = cs.status === 'published' ? 'draft' : 'published';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('case_studies') as any)
      .update({ status: next, updated_at: new Date().toISOString() })
      .eq('id', cs.id);
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
        <PageBreadcrumb pageTitle="Case Studies" />
        <button
          onClick={() => setEditing(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all projects
        </button>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project title</label>
              <input
                className={inputCls}
                value={editing.title}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!slugTouched) set('slug', slugify(e.target.value));
                }}
                placeholder="50,000 units of solar water pumps for AgriCorp"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Client name</label>
                <input className={inputCls} value={editing.client_name ?? ''} onChange={(e) => set('client_name', e.target.value)} placeholder="AgriCorp Ltd." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL slug</label>
                <input
                  className={inputCls}
                  value={editing.slug}
                  onChange={(e) => { setSlugTouched(true); set('slug', e.target.value); }}
                  onBlur={(e) => set('slug', slugify(e.target.value))}
                  placeholder="agricorp-solar-pumps"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Summary</label>
              <textarea
                className={`${inputCls} min-h-[90px] resize-y`}
                value={editing.summary ?? ''}
                onChange={(e) => set('summary', e.target.value)}
                placeholder="What you sourced, the challenge, and the outcome — two or three sentences."
              />
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                <input className={inputCls} value={editing.location ?? ''} onChange={(e) => set('location', e.target.value)} placeholder="Morocco" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                <input className={inputCls} value={editing.year ?? ''} onChange={(e) => set('year', e.target.value)} placeholder="2024" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scope</label>
                <input className={inputCls} value={editing.scope ?? ''} onChange={(e) => set('scope', e.target.value)} placeholder="Sourcing + QC + freight" />
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
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">Headline metric &amp; media</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Metric value</label>
                  <input className={inputCls} value={editing.metric_value ?? ''} onChange={(e) => set('metric_value', e.target.value)} placeholder="50,000" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Metric label</label>
                  <input className={inputCls} value={editing.metric_label ?? ''} onChange={(e) => set('metric_label', e.target.value)} placeholder="units shipped" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cover image URL</label>
                <input className={inputCls} value={editing.cover_image ?? ''} onChange={(e) => set('cover_image', e.target.value)} placeholder="https://…" />
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
      <PageBreadcrumb pageTitle="Case Studies" />
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Showcase completed projects with the client, a headline metric, and a photo. Published projects appear in the
          &ldquo;Selected projects&rdquo; section of your homepage — your strongest trust signal for new buyers.
        </p>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New project
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading projects…</div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No projects yet. Add your first one to build buyer trust.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((cs) => (
            <div
              key={cs.id}
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <button onClick={() => { setSlugTouched(true); setEditing(cs); }} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{cs.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      cs.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {cs.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">
                  {[cs.client_name, cs.location, cs.year].filter(Boolean).join(' · ') || `/${cs.slug}`}
                </span>
              </button>
              {cs.status === 'published' && companySlug && (
                <a
                  href={`/site/${companySlug}#projects`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-600 hover:underline flex-shrink-0"
                >
                  View
                </a>
              )}
              <button
                onClick={() => togglePublish(cs)}
                title={cs.status === 'published' ? 'Unpublish' : 'Publish'}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {cs.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => remove(cs.id)}
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

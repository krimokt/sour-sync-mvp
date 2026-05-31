'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';
import { supabase } from '@/lib/supabase';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { toast } from 'sonner';
import { Plus, Save, Trash2, ArrowLeft, Eye, EyeOff, FileText } from 'lucide-react';

interface Post {
  id: string;
  company_id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  cover_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  focus_keyword: string | null;
  og_image: string | null;
  status: string;
  published_at: string | null;
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

const emptyDraft = (companyId: string): Post => ({
  id: '',
  company_id: companyId,
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  cover_image: '',
  meta_title: '',
  meta_description: '',
  focus_keyword: '',
  og_image: '',
  status: 'draft',
  published_at: null,
  updated_at: null,
});

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/40';

export default function BlogAdminPage() {
  const { company } = useStore();
  const companyId = (company as { id?: string; slug?: string } | null)?.id;
  const companySlug = (company as { slug?: string } | null)?.slug;

  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [editing, setEditing] = useState<Post | null>(null);
  const [saving, setSaving] = useState(false);
  const [slugTouched, setSlugTouched] = useState(false);

  const load = async () => {
    if (!companyId) return;
    setLoading(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (supabase.from('blog_posts') as any)
      .select('*')
      .eq('company_id', companyId)
      .order('updated_at', { ascending: false });
    setPosts((data ?? []) as Post[]);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  const set = (field: keyof Post, value: string) =>
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
      excerpt: editing.excerpt || null,
      content: editing.content || null,
      cover_image: editing.cover_image || null,
      meta_title: editing.meta_title || null,
      meta_description: editing.meta_description || null,
      focus_keyword: editing.focus_keyword || null,
      og_image: editing.og_image || null,
      status,
      published_at:
        status === 'published' ? editing.published_at || new Date().toISOString() : editing.published_at,
      updated_at: new Date().toISOString(),
    };

    setSaving(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const table = supabase.from('blog_posts') as any;
    const { error } = editing.id
      ? await table.update(payload).eq('id', editing.id)
      : await table.insert(payload);
    setSaving(false);

    if (error) {
      toast.error(error.message?.includes('duplicate') ? 'That slug is already used' : 'Could not save post');
      return;
    }
    toast.success(status === 'published' ? 'Post published' : 'Draft saved');
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('blog_posts') as any).delete().eq('id', id);
    if (error) {
      toast.error('Could not delete post');
      return;
    }
    toast.success('Post deleted');
    load();
  };

  const togglePublish = async (post: Post) => {
    const next = post.status === 'published' ? 'draft' : 'published';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from('blog_posts') as any)
      .update({
        status: next,
        published_at: next === 'published' ? post.published_at || new Date().toISOString() : post.published_at,
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id);
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
        <PageBreadcrumb pageTitle="Blog" />
        <button
          onClick={() => setEditing(null)}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" /> Back to all posts
        </button>

        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 md:p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                className={inputCls}
                value={editing.title}
                onChange={(e) => {
                  set('title', e.target.value);
                  if (!slugTouched) set('slug', slugify(e.target.value));
                }}
                placeholder="How to source water pumps from Morocco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL slug</label>
              <input
                className={inputCls}
                value={editing.slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  set('slug', e.target.value);
                }}
                onBlur={(e) => set('slug', slugify(e.target.value))}
                placeholder="how-to-source-water-pumps-from-morocco"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Excerpt</label>
              <textarea
                className={`${inputCls} min-h-[70px] resize-y`}
                value={editing.excerpt ?? ''}
                onChange={(e) => set('excerpt', e.target.value)}
                placeholder="One or two sentences shown in the blog list and search results."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Content <span className="text-gray-400 font-normal">(plain text; blank line = new paragraph)</span>
              </label>
              <textarea
                className={`${inputCls} min-h-[320px] resize-y font-mono text-[13px]`}
                value={editing.content ?? ''}
                onChange={(e) => set('content', e.target.value)}
                placeholder="Write your article here…"
              />
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
              <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">SEO &amp; media</div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Cover image URL</label>
                <input className={inputCls} value={editing.cover_image ?? ''} onChange={(e) => set('cover_image', e.target.value)} placeholder="https://…" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta title</label>
                <input className={inputCls} value={editing.meta_title ?? ''} onChange={(e) => set('meta_title', e.target.value)} placeholder="Defaults to the title" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Meta description</label>
                <textarea className={`${inputCls} min-h-[64px] resize-y`} value={editing.meta_description ?? ''} onChange={(e) => set('meta_description', e.target.value)} placeholder="Defaults to the excerpt" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Focus keyword</label>
                <input className={inputCls} value={editing.focus_keyword ?? ''} onChange={(e) => set('focus_keyword', e.target.value)} placeholder="e.g. water pump sourcing morocco" />
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
      <PageBreadcrumb pageTitle="Blog" />
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
          Publish articles to rank for long-tail searches. Each post gets its own SEO metadata, Article schema, and a
          spot in your sitemap.
        </p>
        <button
          onClick={startNew}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> New post
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500 text-sm">Loading posts…</div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 p-12 text-center">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No posts yet. Write your first article to start ranking for buyer searches.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            >
              <button onClick={() => { setSlugTouched(true); setEditing(p); }} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{p.title}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${
                      p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <span className="text-xs text-gray-400">/{p.slug}</span>
              </button>
              {p.status === 'published' && companySlug && (
                <a
                  href={`/site/${companySlug}/blog/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-600 hover:underline flex-shrink-0"
                >
                  View
                </a>
              )}
              <button
                onClick={() => togglePublish(p)}
                title={p.status === 'published' ? 'Unpublish' : 'Publish'}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {p.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => remove(p.id)}
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

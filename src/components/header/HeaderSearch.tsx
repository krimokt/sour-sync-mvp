'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, Package, Users, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type ResultType = 'quotation' | 'product' | 'client';

interface SearchResult {
  type: ResultType;
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

const TYPE_META: Record<ResultType, { label: string; Icon: React.ComponentType<{ className?: string }> }> = {
  quotation: { label: 'Quotations', Icon: FileText },
  product: { label: 'Products', Icon: Package },
  client: { label: 'Clients', Icon: Users },
};

interface HeaderSearchProps {
  companySlug: string;
  inputRef: React.RefObject<HTMLInputElement>;
  className?: string;
  width?: number;
}

export default function HeaderSearch({ companySlug, inputRef, className, width = 340 }: HeaderSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);
  const companyIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getCompanyId = useCallback(async () => {
    if (companyIdRef.current) return companyIdRef.current;
    const { data } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', companySlug)
      .single();
    companyIdRef.current = data?.id ?? null;
    return companyIdRef.current;
  }, [companySlug]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      const companyId = await getCompanyId();
      if (!companyId) { setLoading(false); return; }

      const q = `%${query}%`;
      const bp = `/store/${companySlug}`;

      const [quotRes, prodRes, clientRes] = await Promise.all([
        supabase
          .from('quotations')
          .select('id, product_name, status')
          .eq('company_id', companyId)
          .ilike('product_name', q)
          .limit(4),
        supabase
          .from('products')
          .select('id, name, is_published')
          .eq('company_id', companyId)
          .ilike('name', q)
          .limit(4),
        supabase
          .from('clients')
          .select('id, company_name, status')
          .eq('company_id', companyId)
          .ilike('company_name', q)
          .limit(4),
      ]);

      const combined: SearchResult[] = [
        ...(quotRes.data || []).map(r => ({
          type: 'quotation' as ResultType,
          id: r.id,
          title: r.product_name || 'Untitled quotation',
          subtitle: r.status || undefined,
          href: `${bp}/quotations`,
        })),
        ...(prodRes.data || []).map(r => ({
          type: 'product' as ResultType,
          id: r.id,
          title: r.name,
          subtitle: r.is_published ? 'Published' : 'Draft',
          href: `${bp}/products`,
        })),
        ...(clientRes.data || []).map(r => ({
          type: 'client' as ResultType,
          id: r.id,
          title: r.company_name || 'Individual',
          subtitle: r.status || undefined,
          href: `${bp}/clients`,
        })),
      ];

      setResults(combined);
      setIsOpen(combined.length > 0);
      setLoading(false);
      setSelectedIdx(-1);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, companySlug, getCompanyId]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = (result: SearchResult) => {
    router.push(result.href);
    setQuery('');
    setIsOpen(false);
    setSelectedIdx(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(i => Math.min(i + 1, results.length - 1));
      setIsOpen(true);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && selectedIdx >= 0) {
      navigate(results[selectedIdx]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIdx(-1);
    }
  };

  // Group results by type preserving order: quotation, product, client
  const order: ResultType[] = ['quotation', 'product', 'client'];
  const grouped = results.reduce<Partial<Record<ResultType, SearchResult[]>>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = [];
    acc[r.type]!.push(r);
    return acc;
  }, {});

  const statusColor = (s?: string) => {
    if (!s) return 'bg-gray-100 text-gray-500';
    const lower = s.toLowerCase();
    if (lower === 'active' || lower === 'approved' || lower === 'published') return 'bg-green-50 text-green-700';
    if (lower === 'pending') return 'bg-amber-50 text-amber-700';
    if (lower === 'rejected' || lower === 'inactive' || lower === 'draft') return 'bg-gray-100 text-gray-500';
    return 'bg-gray-100 text-gray-500';
  };

  return (
    <div ref={containerRef} className={`relative ${className ?? 'hidden lg:block'}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <Search className="w-4 h-4 text-gray-400" aria-hidden="true" />
      </span>

      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search quotations, products, clients…"
        className="hdr2-search"
        style={{ width, paddingRight: 32 }}
        autoComplete="off"
      />

      {loading && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="animate-spin w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
        </span>
      )}

      {!loading && query && (
        <button
          type="button"
          onClick={() => { setQuery(''); setIsOpen(false); setResults([]); inputRef.current?.focus(); }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5 rounded transition-colors"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
             style={{ width: Math.max(width, 380) }}>
          <div className="py-1.5 max-h-[400px] overflow-y-auto">
            {order.filter(t => grouped[t]?.length).map(type => {
              const { label, Icon } = TYPE_META[type];
              return (
                <div key={type}>
                  <div className="flex items-center gap-2 px-4 py-1.5 mt-1 first:mt-0">
                    <Icon className="w-3 h-3 text-gray-400 flex-shrink-0" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{label}</span>
                  </div>
                  {grouped[type]!.map(result => {
                    const globalIdx = results.indexOf(result);
                    const isSelected = globalIdx === selectedIdx;
                    return (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => navigate(result)}
                        className={`w-full text-left flex items-center gap-3 px-4 py-2.5 transition-colors ${
                          isSelected ? 'bg-[#06b6d4]/8 text-gray-900' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{result.title}</div>
                        </div>
                        {result.subtitle && (
                          <span className={`flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${statusColor(result.subtitle)}`}>
                            {result.subtitle}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 px-4 py-2 flex items-center gap-4 text-[11px] text-gray-400">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
          </div>
        </div>
      )}

      {isOpen && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full left-0 mt-2 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden"
             style={{ width: Math.max(width, 380) }}>
          <div className="px-4 py-6 text-center text-sm text-gray-400">
            No results for <span className="font-medium text-gray-600">&ldquo;{query}&rdquo;</span>
          </div>
        </div>
      )}
    </div>
  );
}

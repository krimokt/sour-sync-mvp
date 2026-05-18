'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, Search } from 'lucide-react';

export default function StoreNotFound() {
  const pathname = usePathname();
  const slugMatch = pathname?.match(/^\/store\/([^/]+)/);
  const slug = slugMatch?.[1] ?? '';
  const dashboardHref = slug ? `/store/${slug}` : '/signin';

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8"
      style={{ fontFamily: 'var(--font-jakarta, system-ui, sans-serif)' }}
    >
      <div className="w-full max-w-lg text-center">

        {/* Giant faded 404 */}
        <div className="relative mb-6 select-none">
          <span
            className="block text-[9rem] font-extrabold leading-none tracking-tighter"
            style={{ color: 'oklch(0.92 0.02 238)' }}
          >
            404
          </span>
          {/* Cyan underline accent */}
          <span
            className="absolute bottom-2 left-1/2 -translate-x-1/2 h-1 w-20 rounded-full"
            style={{ background: '#06b6d4' }}
          />
        </div>

        {/* Icon */}
        <div
          className="mx-auto mb-6 w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{ background: 'oklch(0.95 0.012 238)' }}
        >
          <Search className="w-6 h-6" style={{ color: '#06b6d4' }} />
        </div>

        {/* Copy */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
          Page not found
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          Check the URL or navigate back to your dashboard.
        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft size={15} />
            Go back
          </button>
          <Link
            href={dashboardHref}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 shadow-sm"
            style={{ background: '#06b6d4', boxShadow: '0 4px 14px rgba(6,182,212,0.35)' }}
          >
            <LayoutDashboard size={15} />
            Go to Dashboard
          </Link>
        </div>

        {/* Breadcrumb hint */}
        {pathname && (
          <p className="mt-8 text-xs text-gray-400 font-mono">
            {pathname}
          </p>
        )}
      </div>
    </div>
  );
}

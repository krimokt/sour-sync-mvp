'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Package } from 'lucide-react';

export default function ClientNotFound() {
  const pathname = usePathname();
  const slugMatch = pathname?.match(/^\/client\/([^/]+)/);
  const slug = slugMatch?.[1] ?? '';
  const portalHref = slug ? `/client/${slug}` : '/';
  const signinHref = slug ? `/site/${slug}/signin` : '/';

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center p-8"
      style={{ fontFamily: 'var(--font-jakarta, system-ui, sans-serif)' }}
    >
      <div className="w-full max-w-lg">

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-[0_8px_40px_rgba(0,0,0,0.06)] p-10 text-center">

          {/* Giant faded 404 */}
          <div className="relative mb-4 select-none">
            <span
              className="block text-[8rem] font-extrabold leading-none tracking-tighter"
              style={{ color: 'oklch(0.94 0.015 238)' }}
            >
              404
            </span>
            <span
              className="absolute bottom-1 left-1/2 -translate-x-1/2 h-1 w-16 rounded-full"
              style={{ background: '#0f7aff' }}
            />
          </div>

          {/* Icon */}
          <div
            className="mx-auto mb-5 w-12 h-12 rounded-2xl flex items-center justify-center"
            style={{ background: 'rgba(15,122,255,0.08)' }}
          >
            <Package className="w-5 h-5" style={{ color: '#0f7aff' }} />
          </div>

          {/* Copy */}
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
            Page not found
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-7 max-w-xs mx-auto leading-relaxed">
            This page doesn&apos;t exist or you may not have access to it.
            Head back to your client portal.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              onClick={() => window.history.back()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <ArrowLeft size={14} />
              Go back
            </button>
            <Link
              href={portalHref}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: '#0f7aff', boxShadow: '0 4px 14px rgba(15,122,255,0.3)' }}
            >
              Back to Portal
            </Link>
          </div>

          {/* Divider */}
          <div className="mt-7 pt-6 border-t border-gray-100 dark:border-gray-800">
            <p className="text-xs text-gray-400 mb-2">Not logged in?</p>
            <Link
              href={signinHref}
              className="text-xs font-medium"
              style={{ color: '#0f7aff' }}
            >
              Sign in to your account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

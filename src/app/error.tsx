'use client';

import { useEffect } from 'react';

/**
 * Route-level error boundary for the app router.
 * Required by Next.js 14 — without it, the dev overlay shows
 * "missing required error components, refreshing..." on any thrown error.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface in the browser console; a real error reporter would go here.
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          We hit an unexpected error.
        </h1>
        <p className="mt-3 text-gray-600">
          The page couldn&apos;t render. Try again, and if the problem persists,
          let us know.
        </p>
        {error?.digest && (
          <p className="mt-2 text-xs font-mono text-gray-400">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

'use client';

import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

interface InvalidTokenPageProps {
  error?: string;
}

export default function InvalidTokenPage({ error }: InvalidTokenPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Invalid or Expired Link
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {error || 'This magic link is no longer valid. It may have expired, been revoked, or reached its maximum uses.'}
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
          Please contact the company to request a new link.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  );
}


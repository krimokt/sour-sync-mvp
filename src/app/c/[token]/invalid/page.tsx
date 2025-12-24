import Link from 'next/link';

interface InvalidTokenPageProps {
  params: Promise<{ token: string }>;
}

export default async function InvalidTokenPage({ params }: InvalidTokenPageProps) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
            <svg
              className="h-8 w-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Invalid or Expired Link
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            This magic link is no longer valid. It may have expired, been revoked, or already used.
          </p>
        </div>

        <div className="space-y-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 text-left">
            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              What to do next:
            </h3>
            <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-disc list-inside">
              <li>Contact the company to request a new magic link</li>
              <li>Make sure you're using the most recent link sent to you</li>
              <li>Check that the link hasn't expired (links expire after 30 days)</li>
            </ul>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              If you need a new link, please contact the company directly.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}





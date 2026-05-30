'use client';

import { useEffect } from 'react';

/**
 * Top-level fallback — catches errors thrown in the root layout itself,
 * where the route-level error.tsx can't render because the layout failed.
 *
 * Must render its own <html> and <body> since it replaces the root layout.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          background: '#f9fafb',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          color: '#111827',
        }}
      >
        <div style={{ maxWidth: 480, textAlign: 'center' }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#2563eb',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            Application error
          </p>
          <h1
            style={{
              marginTop: 12,
              fontSize: 28,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            Something went seriously wrong.
          </h1>
          <p style={{ marginTop: 12, color: '#4b5563' }}>
            The root layout failed to render. Reloading usually fixes this.
          </p>
          {error?.digest && (
            <p
              style={{
                marginTop: 8,
                fontSize: 12,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                color: '#9ca3af',
              }}
            >
              Error ID: {error.digest}
            </p>
          )}
          <button
            onClick={() => reset()}
            style={{
              marginTop: 28,
              padding: '10px 20px',
              borderRadius: 8,
              border: 'none',
              background: '#2563eb',
              color: 'white',
              fontWeight: 500,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
